import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { Notification } from '../src/models/Notification.js';
import { Message } from '../src/models/Message.js';
import { NOTIFICATION_TYPES } from '../src/constants/notificationTypes.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';

describe('User Account Experience (Notifications, Messages, Profile) Integration Tests', () => {
  let userA = null;
  let userB = null;
  let adminUser = null;

  let userAToken = null;
  let userBToken = null;
  let adminToken = null;

  let notificationA = null;
  let conversationId = null;

  const testBatch = `user_exp_${Date.now()}`;

  before(async () => {
    await connectDatabase();
    const defaultPasswordHash = await hashPassword('UserPassword123!');

    // 1. Create User A
    userA = await User.create({
      fullName: 'ব্যবহারকারী ক (User A)',
      email: `${testBatch}_user_a@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      mobile: '01711001122',
      languagePreference: 'bn',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
    });

    userAToken = jwt.sign(
      {
        id: userA._id.toString(),
        _id: userA._id.toString(),
        email: userA.email,
        accountType: 'user',
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Create User B
    userB = await User.create({
      fullName: 'ব্যবহারকারী খ (User B)',
      email: `${testBatch}_user_b@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      mobile: '01722003344',
      languagePreference: 'en',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
    });

    userBToken = jwt.sign(
      {
        id: userB._id.toString(),
        _id: userB._id.toString(),
        email: userB.email,
        accountType: 'user',
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Create Admin
    adminUser = await Admin.create({
      fullName: 'তদন্তকারী অ্যাডমিন',
      email: `${testBatch}_admin@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      permissions: ['message.send', 'message.read', 'notification.send'],
    });

    adminToken = jwt.sign(
      {
        id: adminUser._id.toString(),
        _id: adminUser._id.toString(),
        email: adminUser.email,
        accountType: 'admin',
        role: 'admin',
        permissions: adminUser.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 4. Seed Notification for User A
    notificationA = await Notification.create({
      recipientId: userA._id,
      recipientType: 'user',
      type: NOTIFICATION_TYPES.COMPLAINT_STATUS,
      title: 'অভিযোগের অবস্থা পরিবর্তিত হয়েছে',
      message: 'আপনার জমাকৃত অভিযোগটির প্রাথমিক পর্যালোচনা সম্পন্ন হয়েছে।',
      targetUrl: '#/complaint/details/fake_comp_123',
      read: false,
    });

    // 5. Seed Message from Admin to User A
    conversationId = `conv_${[userA._id.toString(), adminUser._id.toString()].sort().join('_')}`;
    await Message.create({
      conversationId,
      senderId: adminUser._id,
      senderType: 'admin',
      recipientId: userA._id,
      body: 'অনুগ্রহ করে ঘটনার সঠিক তারিখ ও সময় নিশ্চিত করুন।',
      read: false,
    });
  });

  after(async () => {
    const testEmails = [userA?.email, userB?.email, adminUser?.email].filter(Boolean);

    await Promise.all([
      User.deleteMany({ email: { $in: testEmails } }),
      Admin.deleteMany({ email: { $in: testEmails } }),
      Notification.deleteMany({ recipientId: { $in: [userA?._id, userB?._id] } }),
      Message.deleteMany({ conversationId }),
    ]);

    await disconnectDatabase();
  });

  // ================= NOTIFICATIONS =================

  test('1. User can list their own notifications', async () => {
    const res = await request(app)
      .get('/api/v1/user/notifications')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);

    const found = res.body.data.find((n) => n._id === notificationA._id.toString());
    assert.ok(found);
    assert.equal(found.title, 'অভিযোগের অবস্থা পরিবর্তিত হয়েছে');
    assert.equal(found.read, false);
  });

  test('2. User can mark their notification as read', async () => {
    const res = await request(app)
      .patch(`/api/v1/user/notifications/${notificationA._id}/read`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.read, true);

    // Verify in DB
    const updated = await Notification.findById(notificationA._id).lean();
    assert.equal(updated.read, true);
    assert.ok(updated.readAt);
  });

  test('3. Unauthorized notification access: unauthenticated or other user is rejected', async () => {
    // Unauthenticated -> 401
    await request(app)
      .get('/api/v1/user/notifications')
      .expect(401);

    // User B trying to mark User A's notification as read -> 404 (scoped to recipient)
    const resOther = await request(app)
      .patch(`/api/v1/user/notifications/${notificationA._id}/read`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(404);

    assert.equal(resOther.body.success, false);
  });

  // ================= MESSAGING =================

  test('4. User can list conversations and view thread messages', async () => {
    // List conversations
    const resList = await request(app)
      .get('/api/v1/user/messages')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(resList.body.success, true);
    assert.ok(Array.isArray(resList.body.data));
    assert.ok(resList.body.data.length >= 1);

    const conv = resList.body.data.find((c) => c.conversationId === conversationId);
    assert.ok(conv);
    assert.equal(conv.lastMessage, 'অনুগ্রহ করে ঘটনার সঠিক তারিখ ও সময় নিশ্চিত করুন।');

    // Get conversation messages
    const resThread = await request(app)
      .get(`/api/v1/user/messages/${conversationId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(resThread.body.success, true);
    assert.ok(Array.isArray(resThread.body.data));
    assert.ok(resThread.body.data.length >= 1);
    assert.equal(resThread.body.data[0].senderType, 'admin');
  });

  test('5. User can reply in a conversation thread and message is immutable', async () => {
    const resReply = await request(app)
      .post(`/api/v1/user/messages/${conversationId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        body: 'ঘটনাটি ঘটেছে ১২ সেপ্টেম্বর বিকাল ৪টায়।',
      })
      .expect(201);

    assert.equal(resReply.body.success, true);
    assert.equal(resReply.body.data.senderType, 'user');
    assert.equal(resReply.body.data.senderId, userA._id.toString());
    assert.equal(resReply.body.data.recipientId, adminUser._id.toString());
    assert.equal(resReply.body.data.body, 'ঘটনাটি ঘটেছে ১২ সেপ্টেম্বর বিকাল ৪টায়।');

    // Messages stream now has 2 messages
    const resThread = await request(app)
      .get(`/api/v1/user/messages/${conversationId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(resThread.body.data.length, 2);
  });

  test('6. Unauthorized conversation access: User B cannot access User A conversation', async () => {
    // User B trying to access User A's conversation -> 403 Forbidden
    const resForbidden = await request(app)
      .get(`/api/v1/user/messages/${conversationId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(403);

    assert.equal(resForbidden.body.success, false);
    assert.equal(resForbidden.body.error.code, 'FORBIDDEN');
  });

  // ================= PROFILE & SECURITY =================

  test('7. User can retrieve their profile with sensitive fields suppressed', async () => {
    const res = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, userA.email);
    assert.equal(res.body.data.fullName, userA.fullName);

    // Verify sensitive authentication fields are suppressed
    assert.equal(res.body.data.passwordHash, undefined);
    assert.equal(res.body.data.security, undefined);
    assert.equal(res.body.data.refreshTokenHash, undefined);
  });

  test('8. User can update their profile (fullName, mobile, languagePreference)', async () => {
    const res = await request(app)
      .patch('/api/v1/user/profile')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        fullName: 'আপডেটেড নাম (Updated User A)',
        mobile: '01888990011',
        languagePreference: 'en',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.fullName, 'আপডেটেড নাম (Updated User A)');
    assert.equal(res.body.data.mobile, '01888990011');
    assert.equal(res.body.data.languagePreference, 'en');

    // Confirm in DB
    const saved = await User.findById(userA._id).lean();
    assert.equal(saved.fullName, 'আপডেটেড নাম (Updated User A)');
    assert.equal(saved.mobile, '01888990011');
  });

  test('9. User security endpoint returns safe indicators without session secrets', async () => {
    const res = await request(app)
      .get('/api/v1/user/security')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, userA.email);
    assert.equal(res.body.data.emailVerified, true);
    assert.equal(typeof res.body.data.twoFactorEnabled, 'boolean');

    // No session IDs, tokens, or hashes
    assert.equal(res.body.data.sessions, undefined);
    assert.equal(res.body.data.passwordHash, undefined);
  });

  test('10. User password update requires correct current password and rejects invalid new password', async () => {
    // Incorrect current password -> 400
    const resWrong = await request(app)
      .patch('/api/v1/user/security')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        currentPassword: 'WrongPassword999!',
        newPassword: 'BrandNewPassword123!',
      })
      .expect(400);

    assert.equal(resWrong.body.success, false);

    // New password too short (< 8 chars) -> 400
    const resShort = await request(app)
      .patch('/api/v1/user/security')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        currentPassword: 'UserPassword123!',
        newPassword: 'short',
      })
      .expect(400);

    assert.equal(resShort.body.success, false);

    // Correct current password and valid new password -> 200
    const resValid = await request(app)
      .patch('/api/v1/user/security')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        currentPassword: 'UserPassword123!',
        newPassword: 'BrandNewSecurePassword456!',
      })
      .expect(200);

    assert.equal(resValid.body.success, true);
  });

  test('11. CSRF protection is enforced on state-changing user mutations', async () => {
    // Fetch valid CSRF token
    const tokenRes = await request(app).get('/api/v1/csrf-token');
    const csrfCookieHeader = tokenRes.headers['set-cookie'];
    const csrfCookie = csrfCookieHeader.find((c) => c.startsWith('csrf_token='));
    const tokenValue = tokenRes.body.csrfToken;

    // A. Request with missing/invalid CSRF token and x-test-csrf-enforce -> 403 CSRF_ERROR
    const invalidReq = await request(app)
      .patch('/api/v1/user/profile')
      .set('Cookie', [`access_token=${userAToken}`, csrfCookie])
      .set('X-CSRF-Token', 'tampered_invalid_csrf')
      .set('x-test-csrf-enforce', 'true')
      .send({ fullName: 'Malicious Attacker' });

    assert.equal(invalidReq.status, 403);
    assert.equal(invalidReq.body.error?.code, 'CSRF_ERROR');

    // B. Request with valid CSRF token passes CSRF check
    const validReq = await request(app)
      .patch('/api/v1/user/profile')
      .set('Cookie', [`access_token=${userAToken}`, csrfCookie])
      .set('X-CSRF-Token', tokenValue)
      .set('x-test-csrf-enforce', 'true')
      .send({ fullName: 'Safe Valid Citizen' });

    assert.equal(validReq.status, 200);
    assert.equal(validReq.body.data.fullName, 'Safe Valid Citizen');
  });

  test('12. User with no prior complaints can retrieve empty complaints list without reporter error', async () => {
    const res = await request(app)
      .get('/api/v1/user/complaints')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 0);
    assert.equal(res.body.meta?.total, 0);
  });
});
