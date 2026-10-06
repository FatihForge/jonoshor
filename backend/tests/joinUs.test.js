import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { JoinUsSubmission } from '../src/models/JoinUsSubmission.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

describe('Phase 16 — Join Us Submissions Tests', () => {
  const joinUsEmail = `volunteer_${Date.now()}@jonoshor-test.org`;

  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    await JoinUsSubmission.deleteMany({ email: /@jonoshor-test\.org$/ });
    await disconnectDatabase();
  });

  test('1. Public visitor submits valid Join Us application', async () => {
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'তানভীর আহমেদ',
        email: joinUsEmail,
        primaryProfession: 'মানবাধিকার আইনজীবী',
        primaryContributionRole: 'আইনি সহায়তা ও পরামর্শ',
        contributionDetails: 'সুপ্রিম কোর্টে ৫ বছরের আইন পেশার অভিজ্ঞতা রয়েছে, আইনি ড্রাফটিং ও ভিকটিম সাপোর্টে যুক্ত হতে চাই।',
        contactInformation: {
          mobile: '01711223344',
          address: 'ঢাকা, বাংলাদেশ',
        },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);

    const saved = await JoinUsSubmission.findById(res.body.data.id);
    assert.ok(saved);
    assert.equal(saved.submissionStatus, 'submitted');
  });

  test('2. Duplicate Join Us submission with same email is rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'তানভীর আহমেদ ডুপ্লিকেট',
        email: joinUsEmail,
        primaryProfession: 'মানবাধিকার আইনজীবী',
        primaryContributionRole: 'আইনি সহায়তা ও পরামর্শ',
        contributionDetails: 'পুনরায় সাবমিট করার চেষ্টা',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'CONFLICT');
  });
});
