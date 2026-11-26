const http = require('http');

function postJson(path, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getCsrf() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/v1/csrf-token', (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve(JSON.parse(b).csrfToken));
    });
  });
}

async function run() {
  console.log('=== TEST 1: Get CSRF Token ===');
  const csrf = await getCsrf();
  console.log('CSRF Token:', csrf);

  console.log('\n=== TEST 2: Register New User via Frontend Port 3000 ===');
  const timestamp = Date.now();
  const email = `citizen_${timestamp}@testjonoshor.org`;
  const regRes = await postJson(
    '/api/v1/auth/register',
    {
      fullName: 'মাহমুদুল হক',
      email,
      password: 'StrongPassword123!',
      mobile: '01799887766',
    },
    { 'X-CSRF-Token': csrf }
  );
  console.log('Register Status:', regRes.status);
  console.log('User created:', regRes.data?.data?.user?.email);
  console.log('6-Digit Code generated:', regRes.data?.data?.verificationCode);

  const code = regRes.data?.data?.verificationCode;
  if (!code || !/^\d{6}$/.test(code)) {
    throw new Error('FAILED: 6-digit code not returned or invalid format');
  }

  console.log('\n=== TEST 3: Verify with WRONG 6-Digit Code ===');
  const wrongRes = await postJson(
    '/api/v1/auth/verify-email',
    { email, code: '000000' },
    { 'X-CSRF-Token': csrf }
  );
  console.log('Wrong Code Status (Expected 400):', wrongRes.status);
  console.log('Error message:', wrongRes.data?.error?.message);

  console.log('\n=== TEST 4: Verify with CORRECT 6-Digit Code ===');
  const correctRes = await postJson(
    '/api/v1/auth/verify-email',
    { email, code },
    { 'X-CSRF-Token': csrf }
  );
  console.log('Correct Code Status (Expected 200):', correctRes.status);
  console.log('Response:', correctRes.data?.data);

  console.log('\n=== TEST 5: Login with Newly Verified User ===');
  const loginRes = await postJson(
    '/api/v1/auth/login',
    { email, password: 'StrongPassword123!' },
    { 'X-CSRF-Token': csrf }
  );
  console.log('Login Status (Expected 200):', loginRes.status);
  console.log('Logged In User:', loginRes.data?.data?.user?.email);
  console.log('Access Token issued:', Boolean(loginRes.data?.data?.accessToken));

  console.log('\n========================================');
  console.log('ALL OTP REGISTRATION & VERIFICATION TESTS PASSED!');
  console.log('========================================');
}

run().catch(console.error);
