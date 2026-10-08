import { calculateSha256 } from './crypto.js';

/**
 * Builds rich security identifiers metadata according to the security & abuse model
 * Captures:
 * - timestamp
 * - approximate area (division, district, upazila)
 * - browser / session identifiers (userAgent, secChUa, platform, acceptLanguage, sessionFingerprint)
 * - anonymous submission ID (from cookie, header, or param)
 * - source (channel / origin)
 * - security events
 * - IP address
 */
export function buildSecurityIdentifiers({
  req = null,
  ip = null,
  userAgent = null,
  location = {},
  anonymousSubmissionId = null,
  source = 'public_web',
  securityEvents = [],
} = {}) {
  const clientIp = ip || req?.ip || '127.0.0.1';
  const clientUserAgent = userAgent || req?.headers?.['user-agent'] || 'unknown';

  // 1. anonymous submission ID: from cookie, header, body, or param
  const anonId =
    anonymousSubmissionId ||
    req?.cookies?.['anon_sub_id'] ||
    req?.headers?.['x-submission-id'] ||
    req?.body?.anonymousSubmissionId ||
    null;

  // 2. browser / session signals
  const secChUa = req?.headers?.['sec-ch-ua'] || null;
  const platform = req?.headers?.['sec-ch-ua-platform'] || null;
  const acceptLanguage = req?.headers?.['accept-language'] || null;

  // Non-sensitive fingerprint derived from client headers & user-agent
  const fingerprintRaw = `${clientUserAgent}|${secChUa || ''}|${platform || ''}|${acceptLanguage || ''}`;
  const sessionFingerprint = calculateSha256(fingerprintRaw);

  // 3. approximate area (from complaint location or client hints)
  const approximateArea = {
    divisionId: location?.divisionId || req?.headers?.['x-client-division'] || null,
    districtId: location?.districtId || req?.headers?.['x-client-district'] || null,
    upazilaId: location?.upazilaId || null,
  };

  // 4. source
  const clientSource = req?.headers?.['x-submission-source'] || source;

  // 5. security events
  const events =
    Array.isArray(securityEvents) && securityEvents.length > 0
      ? securityEvents
      : [{ event: 'SUBMISSION_ATTEMPT', timestamp: new Date() }];

  return {
    timestamp: new Date(),
    approximateArea,
    browserSessionIdentifiers: {
      userAgent: clientUserAgent,
      secChUa,
      platform,
      acceptLanguage,
      sessionFingerprint,
    },
    anonymousSubmissionId: anonId,
    source: clientSource,
    securityEvents: events,
    ip: clientIp,
  };
}
