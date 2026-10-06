import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Phase 2 — Backend Foundation Tests', () => {
  test('GET /api/v1/health returns success: true and status 200', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { success: true });
  });

  test('Request ID header is attached to responses', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.ok(res.headers['x-request-id']);
  });

  test('GET /api/v1/non-existent returns 404 with standard error format', async () => {
    const res = await request(app).get('/api/v1/non-existent');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.ok(res.body.requestId);
  });
});
