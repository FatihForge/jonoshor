export default function sitemap() {
  const baseUrl = 'https://jonoshor.org';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/reports`, lastModified, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/statistics`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/complaints/new`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/join-us`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/how-it-works`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/safety`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
