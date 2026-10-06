import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { isSafePublicUrl } from '../src/utils/urlValidation.js';
import { sanitizeMongoQuery, escapeHtml } from '../src/utils/sanitize.js';
import { auditService } from '../src/services/audit/audit.service.js';
import { securityLogService } from '../src/services/security/securityLog.service.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { SecurityLog } from '../src/models/SecurityLog.js';
import jwt from 'jsonwebtoken';
import { authConfig } from '../src/config/auth.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

describe('Phase 8 — Security Baseline Tests', () => {
  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    await AuditLog.deleteMany({ action: 'TEST_ACTION' });
    await SecurityLog.deleteMany({ eventType: 'TEST_EVENT' });
    await disconnectDatabase();
  });

  test('1. Security Headers: Helmet, HSTS, CSP, and X-Content-Type-Options present', async () => {
    const res = await request(app).get('/api/v1/health');

    // CSP
    assert.ok(res.headers['content-security-policy'], 'CSP header should be present');

    // HSTS
    assert.ok(res.headers['strict-transport-security'], 'HSTS header should be present');

    // X-Content-Type-Options
    assert.equal(res.headers['x-content-type-options'], 'nosniff');

    // X-Frame-Options
    assert.equal(res.headers['x-frame-options'], 'DENY');

    // Request ID
    assert.ok(res.headers['x-request-id']);
  });

  test('2. NoSQL Injection protection sanitizes $-prefixed keys', () => {
    const maliciousInput = {
      email: 'test@example.com',
      $where: 'function() { return true; }',
      nested: {
        $gt: '',
        safeField: 'normalValue',
      },
    };

    const sanitized = sanitizeMongoQuery(maliciousInput);
    assert.equal(sanitized.$where, undefined);
    assert.equal(sanitized.nested.$gt, undefined);
    assert.equal(sanitized.nested.safeField, 'normalValue');
    assert.equal(sanitized.email, 'test@example.com');
  });

  test('3. XSS protection escapes dangerous HTML characters', () => {
    const dangerousString = `<script>alert("xss")</script><img src='x' onerror='alert(1)'>`;
    const escaped = escapeHtml(dangerousString);
    assert.equal(escaped.includes('<script>'), false);
    assert.equal(escaped.includes('&lt;script&gt;'), true);
  });

  test('4. SSRF protection blocks private IPs, metadata endpoints, and loopback', () => {
    // Should be blocked
    assert.equal(isSafePublicUrl('http://localhost:5000'), false);
    assert.equal(isSafePublicUrl('http://127.0.0.1:8080'), false);
    assert.equal(isSafePublicUrl('http://10.0.0.5/api'), false);
    assert.equal(isSafePublicUrl('http://192.168.1.1/admin'), false);
    assert.equal(isSafePublicUrl('http://172.20.0.1/status'), false);
    assert.equal(isSafePublicUrl('http://169.254.169.254/latest/meta-data/'), false);
    assert.equal(isSafePublicUrl('http://metadata.google.internal/computeMetadata/v1/'), false);
    assert.equal(isSafePublicUrl('file:///etc/passwd'), false);
    assert.equal(isSafePublicUrl('ftp://ftp.example.com'), false);

    // Valid public web URLs should be permitted
    assert.equal(isSafePublicUrl('https://example.com/reports/document.pdf'), true);
    assert.equal(isSafePublicUrl('https://bangladesh.gov.bd/press-release'), true);
  });

  test('5. Audit logging writes immutable entry without exposing sensitive passwords', async () => {
    const log = await auditService.log({
      actorType: 'admin',
      action: 'TEST_ACTION',
      resourceType: 'complaint',
      metadata: {
        note: 'Status review performed',
        password: 'SuperSecretPasswordDoNotLog',
        secret: 'CriticalSecretKey',
      },
    });

    assert.ok(log);
    assert.equal(log.action, 'TEST_ACTION');
    assert.equal(log.metadata.note, 'Status review performed');
    assert.equal(log.metadata.password, undefined);
    assert.equal(log.metadata.secret, undefined);
  });

  test('6. Security logging records security incident event', async () => {
    const log = await securityLogService.log({
      eventType: 'TEST_EVENT',
      riskSignal: 'excessive_failed_attempts',
      actionTaken: 'temporary_cooldown',
      metadata: {
        ip: '198.51.100.1',
      },
    });

    assert.ok(log);
    assert.equal(log.eventType, 'TEST_EVENT');
    assert.equal(log.riskSignal, 'excessive_failed_attempts');
    assert.equal(log.actionTaken, 'temporary_cooldown');
  });

  test('7. CSRF Protection: Token endpoint provides valid token and protects state-changing requests', async () => {
    // A. GET /api/v1/csrf-token generates a valid token and sets cookie
    const tokenRes = await request(app).get('/api/v1/csrf-token');
    assert.equal(tokenRes.status, 200);
    assert.equal(tokenRes.body.success, true);
    assert.ok(tokenRes.body.csrfToken);

    const csrfCookieHeader = tokenRes.headers['set-cookie'];
    assert.ok(csrfCookieHeader, 'Set-Cookie for csrf_token must be present');
    const csrfCookie = csrfCookieHeader.find((c) => c.startsWith('csrf_token='));
    assert.ok(csrfCookie);
    const tokenValue = tokenRes.body.csrfToken;

    // B. State-changing request with valid matching CSRF token passes through CSRF check
    const validCsrfReq = await request(app)
      .post('/api/v1/auth/login')
      .set('Cookie', [`csrf_token=${tokenValue}`])
      .set('X-CSRF-Token', tokenValue)
      .set('x-test-csrf-enforce', 'true')
      .send({ email: 'nonexistent@example.com', password: 'Password123!' });
    // Should pass CSRF middleware and reach auth controller (401 or 400, not 403 CSRF_ERROR)
    assert.notEqual(validCsrfReq.body.error?.code, 'CSRF_ERROR');

    // C. State-changing request with mismatched/missing CSRF token is rejected with 403 Forbidden
    const invalidCsrfReq = await request(app)
      .post('/api/v1/auth/login')
      .set('Cookie', [`csrf_token=${tokenValue}`])
      .set('X-CSRF-Token', 'invalid_csrf_token_value')
      .set('x-test-csrf-enforce', 'true')
      .send({ email: 'attacker@example.com', password: 'Password123!' });

    assert.equal(invalidCsrfReq.status, 403);
    assert.equal(invalidCsrfReq.body.error?.code, 'CSRF_ERROR');
  });

  test('8. CORS Preflight: Allows X-Reauth-Token header', async () => {
    const res = await request(app)
      .options('/api/v1/super-admin/financial-settings')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Reauth-Token');

    assert.ok([200, 204].includes(res.status));
    const allowHeaders = res.headers['access-control-allow-headers'];
    assert.ok(allowHeaders);
    assert.ok(allowHeaders.toLowerCase().includes('x-reauth-token'));
  });

  test('9. Super Admin Critical Actions: Protected by requireReAuth middleware', async () => {
    const superAdminToken = jwt.sign(
      {
        id: '670000000000000000000001',
        _id: '670000000000000000000001',
        email: 'superadmin_sec@jonoshor.org',
        accountType: 'superAdmin',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 1. PATCH /api/v1/super-admin/admins/:id/permissions without re-auth -> 401
    const resPerms = await request(app)
      .patch('/api/v1/super-admin/admins/670000000000000000000002/permissions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ permissions: ['complaint.read'] });
    assert.equal(resPerms.status, 401);
    assert.ok(resPerms.body.error?.message.includes('re-authentication'));

    // 2. PATCH /api/v1/super-admin/system-settings/:key without re-auth -> 401
    const resSettings = await request(app)
      .patch('/api/v1/super-admin/system-settings/maintenance_mode')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ value: true });
    assert.equal(resSettings.status, 401);
    assert.ok(resSettings.body.error?.message.includes('re-authentication'));

    // 3. PATCH /api/v1/super-admin/financial-settings without re-auth -> 401
    const resFin = await request(app)
      .patch('/api/v1/super-admin/financial-settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ settings: [] });
    assert.equal(resFin.status, 401);
    assert.ok(resFin.body.error?.message.includes('re-authentication'));
  });

  test('10. Complaint Submission Rate Limiting: Limits submissions per window', async () => {
    // Repeatedly hit public complaints with invalid payload to trigger rate limiter
    const results = [];
    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/v1/public/complaints')
        .set('x-test-rate-limit', 'true')
        .send({});
      results.push(res.status);
    }
    // After 5 attempts, request 6 must be 429 Too Many Requests
    assert.equal(results[5], 429);
  });
});
