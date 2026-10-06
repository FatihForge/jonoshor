import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { seedLocations } from '../src/jobs/seedLocations.js';

describe('Phase 4 — Bangladesh Location Data & APIs', () => {
  before(async () => {
    await connectDatabase();
    await seedLocations();
  });

  after(async () => {
    await disconnectDatabase();
  });

  test('GET /api/v1/public/divisions returns 8 divisions', async () => {
    const res = await request(app).get('/api/v1/public/divisions');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 8);
    const dhaka = res.body.data.find(d => d.id === 'dhaka');
    assert.ok(dhaka);
    assert.equal(dhaka.nameBn, 'ঢাকা');
    assert.equal(dhaka.nameEn, 'Dhaka');
  });

  test('GET /api/v1/public/districts returns 64 districts', async () => {
    const res = await request(app).get('/api/v1/public/districts');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 64);
  });

  test('GET /api/v1/public/districts?divisionId=sylhet filters by division', async () => {
    const res = await request(app).get('/api/v1/public/districts?divisionId=sylhet');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 4); // Sylhet, Moulvibazar, Habiganj, Sunamganj
    for (const d of res.body.data) {
      assert.equal(d.divisionId, 'sylhet');
    }
  });

  test('GET /api/v1/public/districts/dhaka/upazilas returns upazilas for Dhaka', async () => {
    const res = await request(app).get('/api/v1/public/districts/dhaka/upazilas');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    const mirpur = res.body.data.find(u => u.nameEn === 'Mirpur');
    assert.ok(mirpur);
    assert.equal(mirpur.nameBn, 'মিরপুর');
  });
});
