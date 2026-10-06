import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { User } from '../src/models/User.js';
import { SystemSetting } from '../src/models/SystemSetting.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';

describe('Super Admin Settings (Financial & System) Integration Tests', () => {
  let superAdmin = null;
  let normalAdmin = null;
  let normalUser = null;

  let superAdminToken = null;
  let normalAdminToken = null;
  let normalUserToken = null;

  const totpSecret = authenticator.generateSecret();
  const testBatch = `sa_settings_test_${Date.now()}`;
  const seededKeys = [];

  before(async () => {
    await connectDatabase();
    const defaultPasswordHash = await hashPassword('SuperPass123!Secure');

    // 1. Create Super Admin with 2FA enabled
    superAdmin = await SuperAdmin.create({
      fullName: 'প্রধান সুপার অ্যাডমিন সেটিংস',
      email: `${testBatch}_superadmin@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      permissions: ['*'],
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      twoFactorEnabled: true,
      twoFactorSecret: totpSecret,
    });

    superAdminToken = jwt.sign(
      {
        id: superAdmin._id.toString(),
        _id: superAdmin._id.toString(),
        email: superAdmin.email,
        accountType: 'superAdmin',
        role: 'superAdmin',
        permissions: ['*'],
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Create Normal Admin
    normalAdmin = await Admin.create({
      fullName: 'সাধারণ অ্যাডমিন সেটিংস',
      email: `${testBatch}_admin@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      permissions: [PERMISSIONS.COMPLAINT_READ],
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });

    normalAdminToken = jwt.sign(
      {
        id: normalAdmin._id.toString(),
        _id: normalAdmin._id.toString(),
        email: normalAdmin.email,
        accountType: 'admin',
        role: 'admin',
        permissions: normalAdmin.permissions,
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Create Citizen User
    normalUser = await User.create({
      fullName: 'সাধারণ নাগরিক সেটিংস',
      email: `${testBatch}_user@jonoshor-verify.org`,
      passwordHash: defaultPasswordHash,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      authProvider: 'local',
      emailVerified: true,
    });

    normalUserToken = jwt.sign(
      {
        id: normalUser._id.toString(),
        _id: normalUser._id.toString(),
        email: normalUser.email,
        accountType: 'user',
        tokenVersion: 0,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    // Cleanup synthetic test users and super admin
    const testEmails = [
      superAdmin?.email,
      normalAdmin?.email,
      normalUser?.email,
    ].filter(Boolean);

    await Promise.all([
      SuperAdmin.deleteMany({ email: { $in: testEmails } }),
      Admin.deleteMany({ email: { $in: testEmails } }),
      User.deleteMany({ email: { $in: testEmails } }),
      SystemSetting.deleteMany({ key: { $in: seededKeys } }),
      AuditLog.deleteMany({ actorId: superAdmin?._id }),
    ]);

    await disconnectDatabase();
  });

  // Helper to generate valid re-auth token
  function generateReAuthToken() {
    return jwt.sign(
      { id: superAdmin._id.toString(), purpose: 'critical_reauth' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '10m' }
    );
  }

  // ================= FINANCIAL SETTINGS =================

  test('1. Super Admin can read supported financial settings', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);

    const keys = res.body.data.map((s) => s.key);
    assert.ok(keys.includes('bank_name'));
    assert.ok(keys.includes('bank_account_title'));
  });

  test('2. Unauthorized roles are rejected from reading financial settings', async () => {
    // Normal admin -> 403
    const resAdmin = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${normalAdminToken}`)
      .expect(403);
    assert.equal(resAdmin.body.success, false);

    // Citizen user -> 403
    const resUser = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .expect(403);
    assert.equal(resUser.body.success, false);

    // Unauthenticated -> 401
    const resAnon = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .expect(401);
    assert.equal(resAnon.body.success, false);
  });

  test('3. Modifying financial settings without Re-Auth is rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .patch('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        settings: [{ key: 'bank_name', value: 'Updated Bank' }],
      })
      .expect(401);

    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('re-authentication'));
  });

  test('4. Valid update of financial settings with Re-Auth token succeeds', async () => {
    const reAuthToken = generateReAuthToken();
    const testKey = `${testBatch}_fin_bank`;
    seededKeys.push(testKey);

    const res = await request(app)
      .patch('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .set('X-Reauth-Token', reAuthToken)
      .send({
        settings: [
          { key: testKey, value: 'Synthetic Bangladesh Bank' },
          { key: 'donation_enabled', value: true },
        ],
      })
      .expect(200);

    assert.equal(res.body.success, true);

    // Verify stored setting
    const saved = await SystemSetting.findOne({ key: testKey }).lean();
    assert.ok(saved);
    assert.equal(saved.value, 'Synthetic Bangladesh Bank');
    assert.equal(saved.category, 'financial');
  });

  test('5. Invalid financial settings update payload (non-array) is rejected with 400 ValidationError', async () => {
    const reAuthToken = generateReAuthToken();

    const res = await request(app)
      .patch('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .set('X-Reauth-Token', reAuthToken)
      .send({ settings: 'not-an-array' })
      .expect(400);

    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('6. Sensitive credentials/tokens in financial settings are masked and never exposed raw', async () => {
    const secretKey = `${testBatch}_gateway_api_secret`;
    seededKeys.push(secretKey);

    // Store a sensitive setting in DB directly
    await SystemSetting.create({
      key: secretKey,
      value: 'SUPER_SECRET_PRIVATE_KEY_998877',
      category: 'financial',
      version: 1,
    });

    const res = await request(app)
      .get('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    const secretSetting = res.body.data.find((s) => s.key === secretKey);
    assert.ok(secretSetting);
    // Raw secret must NOT be returned
    assert.notEqual(secretSetting.value, 'SUPER_SECRET_PRIVATE_KEY_998877');
    // Must be masked
    assert.ok(secretSetting.value.includes('••••'));
    assert.equal(secretSetting.isMasked, true);
  });

  // ================= SYSTEM SETTINGS =================

  test('7. Super Admin can read supported system settings grouped by non-financial categories', async () => {
    const res = await request(app)
      .get('/api/v1/super-admin/system-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 5);

    // Ensure financial category is excluded from system-settings
    const financialEntries = res.body.data.filter((s) => s.category === 'financial');
    assert.equal(financialEntries.length, 0);

    // Ensure standard categories exist
    const categories = new Set(res.body.data.map((s) => s.category));
    assert.ok(categories.has('general'));
    assert.ok(categories.has('security'));
    assert.ok(categories.has('complaint'));
  });

  test('8. Unauthorized roles are rejected from reading system settings', async () => {
    // Normal admin -> 403
    const resAdmin = await request(app)
      .get('/api/v1/super-admin/system-settings')
      .set('Authorization', `Bearer ${normalAdminToken}`)
      .expect(403);
    assert.equal(resAdmin.body.success, false);

    // Citizen user -> 403
    const resUser = await request(app)
      .get('/api/v1/super-admin/system-settings')
      .set('Authorization', `Bearer ${normalUserToken}`)
      .expect(403);
    assert.equal(resUser.body.success, false);

    // Unauthenticated -> 401
    const resAnon = await request(app)
      .get('/api/v1/super-admin/system-settings')
      .expect(401);
    assert.equal(resAnon.body.success, false);
  });

  test('9. Modifying a system setting without Re-Auth is rejected with 401 Unauthorized', async () => {
    const res = await request(app)
      .patch('/api/v1/super-admin/system-settings/maintenance_mode')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ value: true })
      .expect(401);

    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('re-authentication'));
  });

  test('10. Valid system setting update with Re-Auth token succeeds', async () => {
    const reAuthToken = generateReAuthToken();
    const testKey = `${testBatch}_sys_rate_limit`;
    seededKeys.push(testKey);

    const res = await request(app)
      .patch(`/api/v1/super-admin/system-settings/${testKey}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .set('X-Reauth-Token', reAuthToken)
      .send({
        value: 120,
        category: 'security',
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.key, testKey);
    assert.equal(res.body.data.value, 120);
    assert.equal(res.body.data.category, 'security');

    // Confirm in DB
    const saved = await SystemSetting.findOne({ key: testKey }).lean();
    assert.ok(saved);
    assert.equal(saved.value, 120);
  });

  test('11. System setting update with missing value is rejected with 400 ValidationError', async () => {
    const reAuthToken = generateReAuthToken();

    const res = await request(app)
      .patch('/api/v1/super-admin/system-settings/platform_name')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .set('X-Reauth-Token', reAuthToken)
      .send({})
      .expect(400);

    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  // ================= AUDIT LOGGING =================

  test('12. Sensitive setting modifications create AuditLog records without secret leaks', async () => {
    // Check audit logs created by superAdmin during the test run
    const auditLogs = await AuditLog.find({
      actorId: superAdmin._id,
      action: { $in: ['SYSTEM_SETTING_UPDATED', 'FINANCIAL_SETTINGS_UPDATED'] },
    }).lean();

    assert.ok(auditLogs.length >= 2);

    for (const log of auditLogs) {
      assert.equal(log.actorType, 'superAdmin');
      assert.equal(log.entity || log.resourceType, 'SystemSetting');
      // Verify no password or private secret in metadata
      const metaStr = JSON.stringify(log.metadata || {});
      assert.equal(/secret|token|password/i.test(metaStr), false);
    }
  });
});
