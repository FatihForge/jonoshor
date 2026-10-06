import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Complaint } from '../src/models/Complaint.js';
import { Reporter } from '../src/models/Reporter.js';
import { CorrectionRequest } from '../src/models/CorrectionRequest.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

describe('Phase 9, 10 & 11 — Reporter System & Complaint Flows', () => {
  let userTokenA = null;
  let userTokenB = null;
  let complaintIdA = null;

  const userAEmail = `complaint_user_a_${Date.now()}@jonoshor-test.org`;
  const userBEmail = `complaint_user_b_${Date.now()}@jonoshor-test.org`;
  const nonUserEmail = `visitor_${Date.now()}@jonoshor-test.org`;
  const password = 'Password123!';

  before(async () => {
    await connectDatabase();

    // Register User A
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'ব্যবহারকারী ক',
      email: userAEmail,
      password,
    });
    await User.updateOne({ email: userAEmail }, { emailVerified: true });
    const loginA = await request(app).post('/api/v1/auth/login').send({
      email: userAEmail,
      password,
    });
    userTokenA = loginA.body.data.accessToken;

    // Register User B
    await request(app).post('/api/v1/auth/register').send({
      fullName: 'ব্যবহারকারী খ',
      email: userBEmail,
      password,
    });
    await User.updateOne({ email: userBEmail }, { emailVerified: true });
    const loginB = await request(app).post('/api/v1/auth/login').send({
      email: userBEmail,
      password,
    });
    userTokenB = loginB.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: /@jonoshor-test\.org$/ });
    await Complaint.deleteMany({});
    await Reporter.deleteMany({});
    await CorrectionRequest.deleteMany({});
    await disconnectDatabase();
  });

  const validComplaintPayload = {
    category: {
      primary: 'বেআইনি আটক ও নির্যাতন',
      secondary: ['মানবাধিকার লঙ্ঘন'],
    },
    incident: {
      startDate: new Date('2026-05-10').toISOString(),
      datePrecision: 'exact',
      ongoing: false,
      description: 'ভুক্তভোগীকে বেআইনিভাবে তুলে নিয়ে একটি গোপন স্থানে ২৪ ঘণ্টা আটকে রেখে মানসিক নির্যাতন করা হয়।',
    },
    location: {
      divisionId: 'dhaka',
      districtId: 'dhaka',
      upazilaId: 'mirpur',
      freeTextLocation: 'মিরপুর ১০ নম্বর গোলচত্বর সংলগ্ন এলাকা',
    },
    accused: [
      {
        name: 'সন্দেহভাজন ব্যক্তি ১',
        role: 'স্থানীয় প্রভাবশালী',
        visibility: 'private',
      },
    ],
    victims: [
      {
        name: 'ভুক্তভোগী নাগরিক',
        age: 32,
        ageCategory: 'adult',
        gender: 'male',
        identityVisibility: 'private',
      },
    ],
  };

  test('1. Registered user submits complaint successfully', async () => {
    const res = await request(app)
      .post('/api/v1/user/complaints')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send(validComplaintPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.complaint._id);
    assert.equal(res.body.data.complaint.status, 'submitted');
    assert.equal(res.body.data.complaint.submissionType, 'user');

    complaintIdA = res.body.data.complaint._id;

    // Verify in database
    const saved = await Complaint.findById(complaintIdA).populate('reporterId');
    assert.ok(saved);
    assert.equal(saved.reporterId.reporterType, 'user');
  });

  test('2. User A can list their own complaints via GET /api/v1/user/complaints', async () => {
    const res = await request(app)
      .get('/api/v1/user/complaints')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0]._id, complaintIdA);
  });

  test('3. Object-level Authorization: User B CANNOT view User A\'s complaint', async () => {
    const res = await request(app)
      .get(`/api/v1/user/complaints/${complaintIdA}`)
      .set('Authorization', `Bearer ${userTokenB}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  test('4. Non-user submits complaint with contact requirement', async () => {
    const visitorPayload = {
      ...validComplaintPayload,
      contact: {
        email: nonUserEmail,
        mobile: '01899999991',
      },
    };

    const res = await request(app)
      .post('/api/v1/public/complaints')
      .send(visitorPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
  });

  test('5. Non-user 5-complaint limit enforcement (6th complaint fails with 403 ACCOUNT_REQUIRED)', async () => {
    const visitorPayload = {
      ...validComplaintPayload,
      contact: {
        email: nonUserEmail,
        mobile: '01899999991',
      },
    };

    // We already submitted 1 complaint for nonUserEmail in test 4.
    // Submit 4 more complaints to reach the limit of 5.
    for (let i = 2; i <= 5; i++) {
      const res = await request(app)
        .post('/api/v1/public/complaints')
        .send(visitorPayload);
      assert.equal(res.status, 201, `Submission ${i} should succeed`);
    }

    // Attempt the 6th complaint — MUST BE DENIED with ACCOUNT_REQUIRED
    const sixthRes = await request(app)
      .post('/api/v1/public/complaints')
      .send(visitorPayload);

    assert.equal(sixthRes.status, 403);
    assert.equal(sixthRes.body.success, false);
    assert.equal(sixthRes.body.error.code, 'ACCOUNT_REQUIRED');
  });

  test('6. Non-user later registers account: existing reporter record is linked without creating new Reporter ID', async () => {
    const reporterBefore = await Reporter.findOne({ 'contact.email': nonUserEmail });
    assert.ok(reporterBefore);
    assert.equal(reporterBefore.reporterType, 'non_user');
    assert.equal(reporterBefore.accountId, null);

    // Register user with same email
    const regRes = await request(app).post('/api/v1/auth/register').send({
      fullName: 'পূর্বের ভিজিটর যিনি এখন ইউজার',
      email: nonUserEmail,
      password: 'StrongPassword123!',
    });
    assert.equal(regRes.status, 201);

    // Check reporter in DB
    const reporterAfter = await Reporter.findById(reporterBefore._id);
    assert.equal(reporterAfter._id.toString(), reporterBefore._id.toString());
    assert.equal(reporterAfter.reporterType, 'user');
    assert.ok(reporterAfter.accountId);
  });

  test('7. User can request withdrawal for their complaint', async () => {
    const res = await request(app)
      .post(`/api/v1/user/complaints/${complaintIdA}/withdraw`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({ reason: 'উভয় পক্ষের মধ্যে ভুল বোঝাবুঝির অবসান হয়েছে।' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.withdrawal.requested, true);
  });

  test('8. User correction requests are tracked and maximum 3 requests are enforced', async () => {
    // 3 correction requests
    for (let i = 1; i <= 3; i++) {
      const res = await request(app)
        .post(`/api/v1/user/complaints/${complaintIdA}/corrections`)
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({
          requestedChanges: `সংশোধনী নং ${i}`,
          reason: `তথ্য হালনাগাদ নং ${i}`,
        });
      assert.equal(res.status, 201);
    }

    // 4th correction request MUST be rejected
    const fourthRes = await request(app)
      .post(`/api/v1/user/complaints/${complaintIdA}/corrections`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        requestedChanges: '৪র্থ সংশোধনী যা বাতিল হবে',
        reason: 'অতিরিক্ত সংশোধনীর চেষ্টা',
      });

    assert.equal(fourthRes.status, 400);
    assert.equal(fourthRes.body.success, false);
    assert.equal(fourthRes.body.error.code, 'CORRECTION_LIMIT_REACHED');
  });
});
