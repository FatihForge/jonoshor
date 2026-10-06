import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as models from '../src/models/index.js';

describe('Phase 3 — MongoDB Models Integrity Tests', () => {
  const expectedModels = [
    'User',
    'Admin',
    'SuperAdmin',
    'Role',
    'Permission',
    'Reporter',
    'Complaint',
    'Evidence',
    'LegalCase',
    'PublicReport',
    'CorrectionRequest',
    'Notification',
    'Message',
    'JoinUsSubmission',
    'Session',
    'RefreshToken',
    'AuditLog',
    'SecurityLog',
    'District',
    'Upazila',
    'SystemSetting',
  ];

  test('All 21 required models are exported and valid Mongoose models', () => {
    assert.equal(expectedModels.length, 21);
    for (const name of expectedModels) {
      assert.ok(models[name], `Model ${name} should be exported`);
      assert.equal(typeof models[name], 'function', `Model ${name} should be a function/constructor`);
      assert.ok(models[name].modelName, `Model ${name} should have modelName`);
    }
  });

  test('User model validation enforces required email and name', () => {
    const user = new models.User({});
    const err = user.validateSync();
    assert.ok(err);
    assert.ok(err.errors['fullName']);
    assert.ok(err.errors['email']);
  });

  test('Reporter model validation enforces at least one contact method', () => {
    const reporter = new models.Reporter({ reporterType: 'user' });
    const err = reporter.validateSync();
    assert.ok(err);
    assert.ok(err.errors['contact']);
  });

  test('Complaint model validation enforces required fields', () => {
    const complaint = new models.Complaint({});
    const err = complaint.validateSync();
    assert.ok(err);
    assert.ok(err.errors['reporterId']);
    assert.ok(err.errors['submissionType']);
    assert.ok(err.errors['category.primary']);
  });
});
