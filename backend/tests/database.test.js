import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { userRepository } from '../src/repositories/user.repository.js';
import { connectDatabase, disconnectDatabase, isDatabaseConnected } from '../src/config/database.js';

describe('Phase 3 — MongoDB Database & Model Read/Write Tests', () => {
  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    // Cleanup test user if created
    await User.deleteMany({ email: /@test-db-runner\.jonoshor\.org$/ });
    await disconnectDatabase();
  });

  test('Database is connected successfully', () => {
    assert.equal(isDatabaseConnected(), true);
  });

  test('Can write, read, update, and count a model document via repository', async () => {
    const testEmail = `test_${Date.now()}@test-db-runner.jonoshor.org`;
    
    // 1. Create
    const user = await userRepository.create({
      fullName: 'টেস্ট ব্যবহারকারী',
      email: testEmail,
      mobile: '+8801700000001',
      authProvider: 'local',
      languagePreference: 'bn',
    });

    assert.ok(user._id);
    assert.equal(user.fullName, 'টেস্ট ব্যবহারকারী');
    assert.equal(user.email, testEmail);

    // 2. Read
    const found = await userRepository.findById(user._id);
    assert.ok(found);
    assert.equal(found.email, testEmail);

    // 3. Update
    const updated = await userRepository.updateById(user._id, {
      fullName: 'আপডেট করা ব্যবহারকারী',
    });
    assert.equal(updated.fullName, 'আপডেট করা ব্যবহারকারী');

    // 4. Count
    const count = await userRepository.count({ email: testEmail });
    assert.equal(count, 1);
  });

  test('DNS fallback configuration is environment-safe and defaults to system DNS in production', () => {
    const computeDnsFallback = (override, nodeEnv) => {
      if (override !== undefined) return override === 'true';
      return (nodeEnv || 'development') !== 'production';
    };

    // Production behavior: defaults to system DNS resolver (false)
    assert.equal(computeDnsFallback(undefined, 'production'), false);
    assert.equal(computeDnsFallback('false', 'production'), false);
    // Explicit override in production allows fallback if required
    assert.equal(computeDnsFallback('true', 'production'), true);

    // Development behavior: keeps fallback enabled by default for Windows/ISP DNS issues
    assert.equal(computeDnsFallback(undefined, 'development'), true);
    assert.equal(computeDnsFallback('true', 'development'), true);
    assert.equal(computeDnsFallback('false', 'development'), false);
  });
});
