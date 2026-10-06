import { URL } from 'url';

/**
 * SSRF-safe URL validation
 * Blocks private IP ranges, loopback addresses, cloud metadata endpoints
 */
export function isSafePublicUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;

  try {
    const parsed = new URL(urlString);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and standard loopbacks
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0'
    ) {
      return false;
    }

    // Block AWS / GCP / Azure metadata endpoint
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false;
    }

    // Check private IPv4 ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);

      // 10.0.0.0/8
      if (octet1 === 10) return false;

      // 172.16.0.0/12
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;

      // 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) return false;

      // 127.0.0.0/8
      if (octet1 === 127) return false;

      // 169.254.0.0/16 (Link-local)
      if (octet1 === 169 && octet2 === 254) return false;

      // 0.0.0.0/8
      if (octet1 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}
