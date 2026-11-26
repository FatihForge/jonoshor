export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/super-admin/', '/user/', '/api/'],
      },
    ],
    sitemap: 'https://jonoshor.org/sitemap.xml',
  };
}
