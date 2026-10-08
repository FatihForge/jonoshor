import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { ContactSubmission } from '../src/models/ContactSubmission.js';
import { SystemSetting } from '../src/models/SystemSetting.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';

describe('Contact Us & Social Links Integration Tests', () => {
  let adminToken;
  let superAdminToken;
  let createdContactId;
  const uniqueBase = Date.now();

  before(async () => {
    await connectDatabase();

    // Create Admin
    const admin = await Admin.create({
      fullName: 'Contact Admin',
      email: `admin_contact_${uniqueBase}@jonoshor-test.org`,
      passwordHash: await hashPassword('AdminPassword123!'),
      permissions: ['complaint.read'],
      accountStatus: 'active',
    });

    adminToken = jwt.sign(
      { id: admin._id, _id: admin._id, email: admin.email, accountType: 'admin' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Create Super Admin
    const superAdmin = await SuperAdmin.create({
      fullName: 'Super Admin',
      email: `superadmin_contact_${uniqueBase}@jonoshor-test.org`,
      passwordHash: await hashPassword('SuperAdminPass123!'),
      twoFactorEnabled: true,
      accountStatus: 'active',
    });

    superAdminToken = jwt.sign(
      { id: superAdmin._id, _id: superAdmin._id, email: superAdmin.email, accountType: 'superAdmin' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    await ContactSubmission.deleteMany({ email: { $regex: /jonoshor-test\.org/ } });
    await Admin.deleteMany({ email: { $regex: /admin_contact_/ } });
    await SuperAdmin.deleteMany({ email: { $regex: /superadmin_contact_/ } });
    await disconnectDatabase();
  });

  test('1. Public user can submit a valid contact inquiry', async () => {
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send({
        name: 'Rashid Ahmed',
        email: `citizen_${uniqueBase}@jonoshor-test.org`,
        phone: '+8801712345678',
        message: 'This is an important inquiry regarding platform documentation and security guidelines.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    createdContactId = res.body.data.id;
  });

  test('2. Contact submission fails validation with invalid email or too short message', async () => {
    const res = await request(app)
      .post('/api/v1/public/contact')
      .send({
        name: 'A',
        email: 'invalid-email-address',
        message: 'short',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('3. Unauthenticated request to admin contact inbox is rejected with 401', async () => {
    const res = await request(app)
      .get('/api/v1/admin/contact');

    assert.equal(res.status, 401);
  });

  test('4. Authenticated admin can view contact submissions with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/admin/contact')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((c) => String(c._id) === String(createdContactId));
    assert.ok(found, 'Created contact message should be in admin list');
    assert.equal(found.status, 'new');
  });

  test('5. Admin can update status and add notes to contact message', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/contact/${createdContactId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'read',
        adminNotes: 'Reviewed by administrator and assigned for reply.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'read');
    assert.equal(res.body.data.adminNotes, 'Reviewed by administrator and assigned for reply.');
  });

  test('6. Public social links endpoint returns default enabled platforms sorted by order', async () => {
    const res = await request(app)
      .get('/api/v1/public/social-links');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 4);

    // Verify Facebook, LinkedIn, YouTube, X are returned with required fields
    const names = res.body.data.map((l) => l.name);
    assert.ok(names.includes('Facebook'));
    assert.ok(names.includes('LinkedIn'));
    assert.ok(names.includes('YouTube'));

    for (const link of res.body.data) {
      assert.ok(link.url);
      assert.ok(link.name);
      assert.ok(link.icon);
    }
  });

  test('7. When a social link is disabled in SystemSetting, it disappears from public API', async () => {
    // Update social_links in SystemSetting to disable YouTube
    const updatedLinks = [
      { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/jonoshor', icon: 'facebook', enabled: true, order: 1 },
      { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/jonoshor', icon: 'linkedin', enabled: true, order: 2 },
      { id: 'youtube', name: 'YouTube', url: 'https://youtube.com/@jonoshor', icon: 'youtube', enabled: false, order: 3 },
      { id: 'x', name: 'X / Twitter', url: 'https://x.com/jonoshor', icon: 'x', enabled: true, order: 4 },
    ];

    await SystemSetting.findOneAndUpdate(
      { key: 'social_links' },
      { value: updatedLinks, category: 'general' },
      { upsert: true, new: true }
    );

    const res = await request(app)
      .get('/api/v1/public/social-links');

    assert.equal(res.status, 200);
    const names = res.body.data.map((l) => l.name);
    assert.ok(names.includes('Facebook'));
    assert.ok(names.includes('LinkedIn'));
    assert.ok(names.includes('X / Twitter'));
    assert.equal(names.includes('YouTube'), false, 'Disabled platform should not appear in public response');

    // Restore YouTube
    updatedLinks[2].enabled = true;
    await SystemSetting.findOneAndUpdate(
      { key: 'social_links' },
      { value: updatedLinks, category: 'general' }
    );
  });
});
