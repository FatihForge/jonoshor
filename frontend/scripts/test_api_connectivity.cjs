const http = require('http');

function testUrl(url, options = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 4000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            url,
            statusCode: res.statusCode,
            headers: res.headers,
            body: data.slice(0, 300),
          });
        });
      }
    );
    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, error: 'TIMEOUT' });
    });
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('=== 1. Direct Backend Connectivity (port 5000) ===');
  const backendEndpoints = [
    'http://localhost:5000/health',
    'http://localhost:5000/api/v1/csrf-token',
    'http://localhost:5000/api/v1/public/districts',
    'http://localhost:5000/api/v1/public/statistics',
    'http://localhost:5000/api/v1/public/reports',
  ];
  for (const u of backendEndpoints) {
    const res = await testUrl(u);
    console.log(`${u} => Status: ${res.statusCode || res.error}`);
  }

  console.log('\n=== 2. Frontend Proxy to Backend (port 3000 -> 5000) ===');
  const frontendProxyEndpoints = [
    'http://localhost:3000/api/v1/csrf-token',
    'http://localhost:3000/api/v1/public/districts',
    'http://localhost:3000/api/v1/public/statistics',
    'http://localhost:3000/api/v1/public/reports',
  ];
  for (const u of frontendProxyEndpoints) {
    const res = await testUrl(u);
    console.log(`${u} => Status: ${res.statusCode || res.error} | Response sample: ${res.body?.substring(0, 80)}`);
  }

  console.log('\n=== 3. Frontend Next.js SSR Web Pages (port 3000) ===');
  const pages = [
    'http://localhost:3000/',
    'http://localhost:3000/reports',
    'http://localhost:3000/statistics',
    'http://localhost:3000/about',
    'http://localhost:3000/how-it-works',
    'http://localhost:3000/safety',
    'http://localhost:3000/contact',
  ];
  for (const u of pages) {
    const res = await testUrl(u);
    console.log(`${u} => Status: ${res.statusCode || res.error}`);
  }
}

run();
