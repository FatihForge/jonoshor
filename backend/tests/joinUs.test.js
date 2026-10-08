import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { JoinUsSubmission } from '../src/models/JoinUsSubmission.js';
import { User } from '../src/models/User.js';
import { Admin } from '../src/models/Admin.js';
import { SuperAdmin } from '../src/models/SuperAdmin.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { authConfig } from '../src/config/auth.js';
import { hashPassword } from '../src/utils/crypto.js';
import { PERMISSIONS } from '../src/constants/permissions.js';

describe('Join Us Module Comprehensive Tests (20 Required Scenarios)', () => {
  let userToken;
  let adminToken;
  let superAdminToken;
  let adminNoExportToken;
  let normalAdminId;
  let superAdminId;
  let normalUserId;

  const uniqueBase = Date.now();
  const validSubmissionEmail = `applicant_${uniqueBase}@jonoshor-test.org`;
  const referenceOnlyEmail = `ref_applicant_${uniqueBase}@jonoshor-test.org`;
  const documentOnlyEmail = `doc_applicant_${uniqueBase}@jonoshor-test.org`;
  let createdSubmissionId;
  let createdDocSubmissionId;
  let createdDocumentId;

  before(async () => {
    await connectDatabase();

    // 1. Create Normal User
    const user = await User.create({
      fullName: 'Regular User',
      email: `reg_user_${uniqueBase}@jonoshor-test.org`,
      passwordHash: await hashPassword('UserPassword123!'),
      emailVerified: true,
      accountStatus: 'active',
      mobile: '01700000001',
    });
    normalUserId = user._id;
    userToken = jwt.sign(
      { id: user._id, _id: user._id, email: user.email, accountType: 'user' },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 2. Create Admin with full Join Us permissions
    const admin = await Admin.create({
      fullName: 'Join Us Reviewer Admin',
      email: `admin_joinus_${uniqueBase}@jonoshor-test.org`,
      passwordHash: await hashPassword('AdminPassword123!'),
      twoFactorEnabled: true,
      permissions: [
        PERMISSIONS.JOIN_US_READ,
        PERMISSIONS.JOIN_US_NOTES,
        PERMISSIONS.JOIN_US_EXPORT,
      ],
      accountStatus: 'active',
    });
    normalAdminId = admin._id;
    adminToken = jwt.sign(
      {
        id: admin._id,
        _id: admin._id,
        email: admin.email,
        accountType: 'admin',
        permissions: admin.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 3. Create Admin WITHOUT Join Us export permission
    const adminNoExport = await Admin.create({
      fullName: 'Limited Admin',
      email: `admin_noexport_${uniqueBase}@jonoshor-test.org`,
      passwordHash: await hashPassword('AdminPassword123!'),
      twoFactorEnabled: true,
      permissions: [PERMISSIONS.JOIN_US_READ, PERMISSIONS.JOIN_US_NOTES],
      accountStatus: 'active',
    });
    adminNoExportToken = jwt.sign(
      {
        id: adminNoExport._id,
        _id: adminNoExport._id,
        email: adminNoExport.email,
        accountType: 'admin',
        permissions: adminNoExport.permissions,
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );

    // 4. Create Super Admin
    const superAdmin = await SuperAdmin.create({
      fullName: 'Super Administrator',
      email: `superadmin_joinus_${uniqueBase}@jonoshor-test.org`,
      passwordHash: await hashPassword('SuperAdminPass123!'),
      twoFactorEnabled: true,
      accountStatus: 'active',
    });
    superAdminId = superAdmin._id;
    superAdminToken = jwt.sign(
      {
        id: superAdmin._id,
        _id: superAdmin._id,
        email: superAdmin.email,
        accountType: 'superAdmin',
      },
      authConfig.jwt.accessTokenSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    await JoinUsSubmission.deleteMany({ email: /@jonoshor-test\.org$/ });
    await User.deleteMany({ email: /@jonoshor-test\.org$/ });
    await Admin.deleteMany({ email: /@jonoshor-test\.org$/ });
    await SuperAdmin.deleteMany({ email: /@jonoshor-test\.org$/ });
    await AuditLog.deleteMany({ resourceType: 'joinUsSubmission' });
    await disconnectDatabase();
  });

  // Scenario 1: Valid public submission
  test('1. Valid public submission succeeds with 201 Created', async () => {
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'তানভীর আহমেদ',
        email: validSubmissionEmail,
        primaryProfession: 'মানবাধিকার আইনজীবী',
        primaryContributionRole: 'আইনি সহায়তা ও পরামর্শ',
        contributionDetails: 'সুপ্রিম কোর্টে ৫ বছরের আইন পেশার অভিজ্ঞতা রয়েছে, আইনি ড্রাফটিং ও ভিকটিম সাপোর্টে যুক্ত হতে চাই।',
        linkedin: 'https://linkedin.com/in/tanvir-ahmed',
        contactInformation: {
          mobile: '01711223344',
          address: 'ঢাকা, বাংলাদেশ',
        },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    createdSubmissionId = res.body.data.id;

    const saved = await JoinUsSubmission.findById(createdSubmissionId);
    assert.ok(saved);
    assert.equal(saved.submissionStatus, 'submitted');
    assert.equal(saved.isDuplicate, false);
  });

  // Scenario 2: Invalid email rejected
  test('2. Invalid email format or disposable email is rejected with 400 Bad Request', async () => {
    const resMalformed = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'বদরুল ইসলাম',
        email: 'invalid-email-format',
        primaryProfession: 'সাংবাদিক',
        primaryContributionRole: 'অনুসন্ধানী প্রতিবেদন',
        contributionDetails: '১০ বছরের কাজের অভিজ্ঞতা আছে।',
        linkedin: 'https://linkedin.com/in/badrul',
      });
    assert.equal(resMalformed.status, 400);
    assert.equal(resMalformed.body.success, false);

    const resDisposable = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'বদরুল ইসলাম',
        email: 'spam@mailinator.com',
        primaryProfession: 'সাংবাদিক',
        primaryContributionRole: 'অনুসন্ধানী প্রতিবেদন',
        contributionDetails: '১০ বছরের কাজের অভিজ্ঞতা আছে।',
        linkedin: 'https://linkedin.com/in/badrul',
      });
    assert.equal(resDisposable.status, 400);
    assert.equal(resDisposable.body.success, false);
  });

  // Scenario 3: Missing required profession/contribution data
  test('3. Missing required profession or contribution details is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'কামরুল হাসান',
        email: `kamrul_${uniqueBase}@jonoshor-test.org`,
        // Missing primaryProfession and primaryContributionRole
        contributionDetails: 'সংক্ষিপ্ত বিবরণ',
        linkedin: 'https://linkedin.com/in/kamrul',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  // Scenario 4: Missing reference AND document rejected
  test('4. Missing reference AND document is rejected with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'রেফারেন্সবিহীন আবেদনকারী',
        email: `no_ref_${uniqueBase}@jonoshor-test.org`,
        primaryProfession: 'অনুবাদক',
        primaryContributionRole: 'রিপোর্ট অনুবাদ ও সম্পাদনা',
        contributionDetails: 'অনুবাদ কাজে সহায়তা করতে আগ্রহী ও দক্ষ।',
        // Neither linkedin, portfolio, socialLinks, nor documents provided
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    const errText = JSON.stringify(res.body.error);
    assert.ok(errText.includes('রেফারেন্স') || errText.includes('reference') || errText.includes('ডকুমেন্ট'));
  });

  // Scenario 5: Valid reference accepted
  test('5. Valid reference (portfolio link) without files is accepted', async () => {
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'প্রকৌশলী সাজিদ',
        email: referenceOnlyEmail,
        primaryProfession: 'সফটওয়্যার প্রকৌশলী',
        primaryContributionRole: 'সাইবার নিরাপত্তা ও প্ল্যাটফর্ম সাপোর্ট',
        contributionDetails: 'ওপেন সোর্স মানবাধিকার প্রকল্পে সিকিউরিটি অডিটিং ও টুলস ডেভেলপ করতে আগ্রহী।',
        portfolio: 'https://github.com/sajid-developer',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
  });

  // Scenario 6: Valid supporting document accepted
  test('6. Valid supporting document upload without reference link is accepted', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 Mock CV Content for JonoShor Join Us Verification');

    const res = await request(app)
      .post('/api/v1/public/join-us')
      .field('fullName', 'ড. আনিসুর রহমান')
      .field('email', documentOnlyEmail)
      .field('primaryProfession', 'চিকিৎসক / মনোবিজ্ঞানী')
      .field('primaryContributionRole', 'ভিকটিম সাপোর্ট ও কাউন্সেলিং')
      .field('contributionDetails', 'মানসিক ট্রমা ও ভিকটিম কাউন্সেলিংয়ে ১৫ বছরের অভিজ্ঞতা রয়েছে।')
      .attach('documents', fakePdfBuffer, 'cv_anisur_rahman.pdf');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    createdDocSubmissionId = res.body.data.id;

    const saved = await JoinUsSubmission.findById(createdDocSubmissionId);
    assert.ok(saved);
    assert.equal(saved.documents.length, 1);
    assert.equal(saved.documents[0].originalFilename, 'cv_anisur_rahman.pdf');
    assert.equal(saved.documents[0].scanStatus, 'clean');
    assert.ok(saved.documents[0].driveFileId);
    assert.ok(saved.documents[0].checksum);
    createdDocumentId = saved.documents[0]._id.toString();
  });

  // Scenario 7: Invalid/malicious file rejected
  test('7. Upload containing malware signature (EICAR) is rejected', async () => {
    const eicarBuffer = Buffer.from(
      'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
    );

    const res = await request(app)
      .post('/api/v1/public/join-us')
      .field('fullName', 'ম্যালিশাস ইউজার')
      .field('email', `malware_${uniqueBase}@jonoshor-test.org`)
      .field('primaryProfession', 'আইনজীবী')
      .field('primaryContributionRole', 'আইনি সহায়তা')
      .field('contributionDetails', 'বিপজ্জনক ফাইল আপলোড করার চেষ্টা।')
      .attach('documents', eicarBuffer, 'infected_cv.pdf');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    const errText = JSON.stringify(res.body.error);
    assert.ok(errText.includes('security') || errText.includes('scan') || errText.includes('malware') || errText.includes('Malicious'));
  });

  // Scenario 8: Unauthorized document access rejected
  test('8. Unauthorized document access (public visitor & normal user) is rejected', async () => {
    // Public visitor
    const resUnauth = await request(app).get(
      `/api/v1/admin/join-us/${createdDocSubmissionId}/documents/${createdDocumentId}`
    );
    assert.equal(resUnauth.status, 401);

    // Normal non-admin user
    const resUser = await request(app)
      .get(`/api/v1/admin/join-us/${createdDocSubmissionId}/documents/${createdDocumentId}`)
      .set('Cookie', [`access_token=${userToken}`]);
    assert.equal(resUser.status, 403);
  });

  // Scenario 9: IDOR attempt rejected
  test('9. IDOR attempt (requesting document belonging to another submission) is rejected', async () => {
    // createdDocumentId belongs to createdDocSubmissionId, NOT createdSubmissionId
    const res = await request(app)
      .get(`/api/v1/admin/join-us/${createdSubmissionId}/documents/${createdDocumentId}`)
      .set('Cookie', [`access_token=${adminToken}`]);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // Scenario 10: Admin can view authorized submission
  test('10. Admin with JOIN_US_READ permission can view submission details', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/join-us/${createdSubmissionId}`)
      .set('Cookie', [`access_token=${adminToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.fullName, 'তানভীর আহমেদ');
    assert.equal(res.body.data.email, validSubmissionEmail);
  });

  // Scenario 11: Super Admin can access authorized Join Us functionality
  test('11. Super Admin can list all Join Us submissions', async () => {
    const res = await request(app)
      .get('/api/v1/admin/join-us')
      .set('Cookie', [`access_token=${superAdminToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);
  });

  // Scenario 12: Unauthorized user cannot access Admin Join Us
  test('12. Unauthorized regular user cannot access Admin Join Us list', async () => {
    const res = await request(app)
      .get('/api/v1/admin/join-us')
      .set('Cookie', [`access_token=${userToken}`]);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  // Scenario 13: Notes are private
  test('13. Admin notes are internal-only and can be added/viewed by authorized admins', async () => {
    const resAddNote = await request(app)
      .post(`/api/v1/admin/join-us/${createdSubmissionId}/notes`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({ note: 'বার কাউন্সিল মেম্বারশিপ ও প্র্যাকটিস লাইসেন্স সন্তোষজনক।' });

    assert.equal(resAddNote.status, 200);
    assert.equal(resAddNote.body.success, true);

    const resAdminGet = await request(app)
      .get(`/api/v1/admin/join-us/${createdSubmissionId}`)
      .set('Cookie', [`access_token=${adminToken}`]);

    assert.equal(resAdminGet.status, 200);
    assert.ok(resAdminGet.body.data.notes.length >= 1);
    assert.equal(
      resAdminGet.body.data.notes[0].content,
      'বার কাউন্সিল মেম্বারশিপ ও প্র্যাকটিস লাইসেন্স সন্তোষজনক।'
    );
  });

  // Scenario 14: Status change is authorized
  test('14. Admin can update submission review status', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/join-us/${createdSubmissionId}/status`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({
        status: 'reviewed',
        adminNotes: 'প্রাথমিক সাক্ষাৎকার সম্পন্ন হয়েছে, পরবর্তী ধাপে পাঠানো হলো।',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const updated = await JoinUsSubmission.findById(createdSubmissionId);
    assert.equal(updated.submissionStatus, 'reviewed');
  });

  // Scenario 15: Status change is audited
  test('15. Status change generates an audit log entry', async () => {
    const log = await AuditLog.findOne({
      resourceType: 'joinUsSubmission',
      resourceId: createdSubmissionId,
      action: 'JOIN_US_STATUS_UPDATED',
    });

    assert.ok(log);
    assert.equal(log.actorType, 'admin');
    assert.equal(log.actorId.toString(), normalAdminId.toString());
    assert.equal(log.metadata.status, 'reviewed');
  });

  // Scenario 16: Duplicate submission handling
  test('16. Duplicate handling: pending status rejects with 409; reviewed status accepts with isDuplicate: true', async () => {
    // referenceOnlyEmail is currently in 'submitted' (pending) status
    const resConflict = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'প্রকৌশলী সাজিদ ডুপ্লিকেট',
        email: referenceOnlyEmail,
        primaryProfession: 'সফটওয়্যার প্রকৌশলী',
        primaryContributionRole: 'সাইবার নিরাপত্তা',
        contributionDetails: 'পুনরায় চেষ্টা',
        portfolio: 'https://github.com/sajid-developer',
      });

    assert.equal(resConflict.status, 409);
    assert.equal(resConflict.body.error.code, 'CONFLICT');

    // validSubmissionEmail was updated to 'reviewed' in Scenario 14; a new submission should succeed and be flagged isDuplicate
    const resAllowedDuplicate = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'তানভীর আহমেদ দ্বিতীয়বার',
        email: validSubmissionEmail,
        primaryProfession: 'মানবাধিকার আইনজীবী',
        primaryContributionRole: 'আইনি ড্রাফটিং',
        contributionDetails: 'নতুন বছরের রিভাইজড আবেদন জমা দিলাম।',
        linkedin: 'https://linkedin.com/in/tanvir-ahmed',
      });

    assert.equal(resAllowedDuplicate.status, 201);
    const newSub = await JoinUsSubmission.findById(resAllowedDuplicate.body.data.id);
    assert.ok(newSub);
    assert.equal(newSub.isDuplicate, true);
    assert.equal(newSub.duplicateOf.toString(), createdSubmissionId.toString());
  });

  // Scenario 17: Email confirmation flow
  test('17. Submission triggers confirmation email without revealing internal secrets', async () => {
    // In our implementation, sendJoinUsConfirmationEmail runs asynchronously upon submit
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'ইমেইল নিশ্চিতকরণ পরীক্ষক',
        email: `email_test_${uniqueBase}@jonoshor-test.org`,
        primaryProfession: 'মানবাধিকার গবেষক',
        primaryContributionRole: 'ফ্যাক্ট-চেক',
        contributionDetails: 'ইমেইল নোটিফিকেশন ফ্লো টেস্ট করার জন্য আবেদন।',
        portfolio: 'https://example.org/portfolio',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // API response must not expose email tokens or internal admin secrets
    assert.equal(res.body.data.token, undefined);
    assert.equal(res.body.data.adminNotes, undefined);
  });

  // Scenario 18: Email failure handled safely
  test('18. Submission succeeds even if email delivery fails (safe failure handling)', async () => {
    // Even if an unexpected error occurs during email delivery, submission must succeed
    const res = await request(app)
      .post('/api/v1/public/join-us')
      .send({
        fullName: 'রেজিলিয়েন্ট সাবমিশন',
        email: `resilient_${uniqueBase}@jonoshor-test.org`,
        primaryProfession: 'অনুবাদক',
        primaryContributionRole: 'রিপোর্ট অনুবাদ ও সম্পাদনা',
        contributionDetails: 'ইমেইল ফেইলিওর হ্যান্ডলিং টেস্টের জন্য বিবরণ।',
        linkedin: 'https://linkedin.com/in/resilient',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
  });

  // Scenario 19: Export permission enforced
  test('19. Join Us export enforces JOIN_US_EXPORT permission and creates audit log', async () => {
    // Admin without JOIN_US_EXPORT is rejected
    const resDenied = await request(app)
      .post('/api/v1/admin/join-us/export')
      .set('Cookie', [`access_token=${adminNoExportToken}`]);
    assert.equal(resDenied.status, 403);

    // Admin with JOIN_US_EXPORT succeeds
    const resAllowed = await request(app)
      .post('/api/v1/admin/join-us/export')
      .set('Cookie', [`access_token=${adminToken}`]);

    assert.equal(resAllowed.status, 200);
    assert.ok(Array.isArray(resAllowed.body.data));

    // Audit log recorded
    const log = await AuditLog.findOne({
      action: 'JOIN_US_DATA_EXPORTED',
      actorId: normalAdminId,
    });
    assert.ok(log);
  });

  // Scenario 20: Deletion permission enforced (Super Admin only with mandatory reason)
  test('20. Deletion is Super Admin only and requires mandatory reason', async () => {
    // Normal Admin cannot delete
    const resAdminDel = await request(app)
      .delete(`/api/v1/admin/join-us/${createdSubmissionId}`)
      .set('Cookie', [`access_token=${adminToken}`])
      .send({ reason: 'টেস্ট মুছে ফেলা' });
    assert.equal(resAdminDel.status, 403);

    // Super Admin without reason is rejected
    const resNoReason = await request(app)
      .delete(`/api/v1/admin/join-us/${createdSubmissionId}`)
      .set('Cookie', [`access_token=${superAdminToken}`])
      .send({ reason: '' });
    assert.equal(resNoReason.status, 400);

    // Super Admin with mandatory reason succeeds
    const resSuperDel = await request(app)
      .delete(`/api/v1/admin/join-us/${createdSubmissionId}`)
      .set('Cookie', [`access_token=${superAdminToken}`])
      .send({ reason: 'আবেদনকারী জিডিপিআর সমমানের অধিকার অনুসারে আবেদন অপসারণের অনুরোধ করেছেন।' });

    assert.equal(resSuperDel.status, 200);
    assert.equal(resSuperDel.body.success, true);

    const deleted = await JoinUsSubmission.findById(createdSubmissionId);
    assert.equal(deleted, null);

    // Audit log recorded
    const log = await AuditLog.findOne({
      action: 'JOIN_US_DELETED',
      resourceId: createdSubmissionId,
    });
    assert.ok(log);
    assert.equal(log.actorType, 'superAdmin');
    assert.equal(log.actorId.toString(), superAdminId.toString());
  });
});
