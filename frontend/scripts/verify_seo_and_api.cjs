const http = require('http');

function fetchHtml(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const descMatch = data.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                          data.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
        const ogTitleMatch = data.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        resolve({
          path,
          statusCode: res.statusCode,
          title: titleMatch ? titleMatch[1] : null,
          description: descMatch ? descMatch[1] : null,
          ogTitle: ogTitleMatch ? ogTitleMatch[1] : null,
        });
      });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

function fetchApi(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            path,
            statusCode: res.statusCode,
            success: json.success,
            dataKeys: json.data ? (Array.isArray(json.data) ? `Array(${json.data.length})` : Object.keys(json.data)) : null,
          });
        } catch {
          resolve({ path, statusCode: res.statusCode, raw: data.substring(0, 80) });
        }
      });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

async function verifyAll() {
  console.log('====================================================');
  console.log('1. VERIFYING PAGE TITLES AND SEO METADATA (ENGLISH)');
  console.log('====================================================');
  const pages = [
    '/',
    '/about',
    '/how-it-works',
    '/reports',
    '/statistics',
    '/safety',
    '/privacy',
    '/terms',
    '/contact',
    '/join-us',
    '/complaints/new',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/user/dashboard',
    '/admin/login',
    '/admin/dashboard',
    '/super-admin/login',
    '/super-admin/dashboard',
  ];

  let anyNonEnglish = false;
  for (const p of pages) {
    const res = await fetchHtml(p);
    // Check if contains Bengali characters (Unicode range \u0980-\u09FF)
    const hasBengaliInTitle = /[\u0980-\u09FF]/.test(res.title || '');
    if (hasBengaliInTitle) anyNonEnglish = true;

    console.log(`[${res.statusCode}] ${p}`);
    console.log(`    Title: ${res.title}`);
    console.log(`    Description: ${res.description ? res.description.substring(0, 75) + '...' : 'NONE'}`);
    console.log(`    Language: ${hasBengaliInTitle ? 'FAILED (Bengali found)' : 'PASSED (English)'}`);
  }

  console.log('\n====================================================');
  console.log('2. VERIFYING FRONTEND-TO-BACKEND API CONNECTIVITY');
  console.log('====================================================');
  const apis = [
    '/api/v1/csrf-token',
    '/api/v1/public/districts',
    '/api/v1/public/statistics',
    '/api/v1/public/reports',
  ];
  for (const a of apis) {
    const res = await fetchApi(a);
    console.log(`[${res.statusCode}] ${a}`);
    console.log(`    Response: ${JSON.stringify(res)}`);
  }

  console.log('\n====================================================');
  console.log(`ALL TITLES ENGLISH VERIFIED: ${!anyNonEnglish ? 'YES (100% PASS)' : 'NO (FAIL)'}`);
  console.log('====================================================');
}

verifyAll();
