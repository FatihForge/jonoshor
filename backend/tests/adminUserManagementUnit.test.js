import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeUserForAdmin } from '../src/services/admin/userAdmin.service.js';
import { ACCOUNT_STATUS } from '../src/constants/accountStatus.js';
import { PERMISSIONS } from '../src/constants/permissions.js';

describe('Admin User Management Unit Tests (Sanitization, Constants & Validation)', () => {
  test('1. sanitizeUserForAdmin strictly deletes all sensitive authentication and security fields', () => {
    const rawUserDoc = {
      _id: '65f123456789abcdef012345',
      fullName: 'আব্দুল করিম',
      email: 'karim@example.com',
      mobile: '01700000000',
      accountStatus: 'active',
      authProvider: 'local',
      authProviderId: 'google-oauth-internal-id-999',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$someSecretHash',
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      twoFactorRecoveryCodes: ['code1', 'code2'],
      refreshTokenHash: 'hash-of-refresh-token',
      security: {
        loginAttempts: 0,
        lockUntil: null,
        passwordChangedAt: new Date(),
      },
      __v: 0,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-02-01'),
    };

    const sanitized = sanitizeUserForAdmin(rawUserDoc);

    // Assert safe fields are kept
    assert.equal(sanitized._id, rawUserDoc._id);
    assert.equal(sanitized.fullName, 'আব্দুল করিম');
    assert.equal(sanitized.email, 'karim@example.com');
    assert.equal(sanitized.mobile, '01700000000');
    assert.equal(sanitized.accountStatus, 'active');
    assert.equal(sanitized.authProvider, 'local');

    // Assert sensitive fields are completely removed
    assert.equal(sanitized.passwordHash, undefined);
    assert.equal(sanitized.authProviderId, undefined);
    assert.equal(sanitized.twoFactorSecret, undefined);
    assert.equal(sanitized.twoFactorRecoveryCodes, undefined);
    assert.equal(sanitized.refreshTokenHash, undefined);
    assert.equal(sanitized.security, undefined);
    assert.equal(sanitized.__v, undefined);
  });

  test('2. sanitizeUserForAdmin handles null or undefined safely', () => {
    assert.equal(sanitizeUserForAdmin(null), null);
    assert.equal(sanitizeUserForAdmin(undefined), null);
  });

  test('3. ACCOUNT_STATUS constants contain only active, suspended, blocked', () => {
    assert.deepEqual(Object.values(ACCOUNT_STATUS), ['active', 'suspended', 'blocked']);
    assert.equal(ACCOUNT_STATUS.ACTIVE, 'active');
    assert.equal(ACCOUNT_STATUS.SUSPENDED, 'suspended');
    assert.equal(ACCOUNT_STATUS.BLOCKED, 'blocked');
  });

  test('4. PERMISSIONS constants contain USER_READ and USER_MANAGE', () => {
    assert.equal(PERMISSIONS.USER_READ, 'user.read');
    assert.equal(PERMISSIONS.USER_MANAGE, 'user.manage');
  });
});
