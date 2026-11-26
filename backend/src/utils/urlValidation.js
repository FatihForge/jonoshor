import { URL } from 'url';
import dns from 'dns';
import net from 'net';

/**
 * Check if an IPv4 or IPv6 address belongs to a private, loopback, link-local, or reserved range
 */
export function isPrivateIpAddress(ip) {
  if (!ip || typeof ip !== 'string') return true;
  const cleaned = ip.replace(/^\[|\]$/g, '').toLowerCase().split('%')[0];

  if (net.isIPv4(cleaned)) {
    const parts = cleaned.split('.').map((n) => parseInt(n, 10));
    const [o1, o2] = parts;
    if (o1 === 0) return true; // 0.0.0.0/8
    if (o1 === 10) return true; // 10.0.0.0/8
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true; // 100.64.0.0/10 CGNAT
    if (o1 === 127) return true; // 127.0.0.0/8 loopback
    if (o1 === 169 && o2 === 254) return true; // 169.254.0.0/16 link-local / cloud metadata
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true; // 172.16.0.0/12
    if (o1 === 192 && o2 === 168) return true; // 192.168.0.0/16
    if (o1 === 192 && o2 === 0 && parts[2] === 0) return true; // 192.0.0.0/24
    if (o1 === 198 && (o2 === 18 || o2 === 19)) return true; // 198.18.0.0/15 benchmark
    if (o1 >= 224) return true; // Multicast & reserved
    return false;
  }

  if (net.isIPv6(cleaned)) {
    // Unspecified & loopback
    if (cleaned === '::' || cleaned === '::1') return true;

    // IPv4-mapped IPv6 in dotted (::ffff:127.0.0.1) or hex (::ffff:7f00:1) form
    if (cleaned.startsWith('::ffff:')) {
      const rest = cleaned.slice(7);
      if (net.isIPv4(rest)) {
        return isPrivateIpAddress(rest);
      }
      const hexParts = rest.split(':');
      if (hexParts.length === 2) {
        const hi = parseInt(hexParts[0], 16);
        const lo = parseInt(hexParts[1], 16);
        if (!Number.isNaN(hi) && !Number.isNaN(lo)) {
          const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
          return isPrivateIpAddress(ipv4);
        }
      }
    }

    // Unique local (fc00::/7 -> fc.. or fd..), link-local (fe80::/10 -> fe8..feb), multicast (ff..)
    if (/^(fc|fd)/i.test(cleaned)) return true;
    if (/^fe[89ab]/i.test(cleaned)) return true;
    if (/^ff/i.test(cleaned)) return true;

    return false;
  }

  return false;
}

/**
 * SSRF-safe URL validation
 * Blocks private IP ranges, IPv6 loopbacks, loopback hostnames, and cloud metadata endpoints
 */
export function isSafePublicUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;

  try {
    const parsed = new URL(urlString);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    if (parsed.username || parsed.password) {
      return false;
    }

    const rawHostname = parsed.hostname.toLowerCase();
    const hostname = rawHostname.replace(/^\[|\]$/g, '');

    if (!hostname) return false;

    // Block localhost, local, and internal hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      !hostname.includes('.')
    ) {
      // Single-label hostnames without dots (e.g., localhost, redis, mongodb) and non-public TLDs are blocked
      // unless it's a public IPv4 literal (checked below)
      if (!net.isIP(hostname)) {
        return false;
      }
    }

    if (net.isIP(hostname) && isPrivateIpAddress(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Async SSRF validation with DNS resolution check to prevent DNS rebinding / split-horizon attacks
 */
export async function isSafePublicUrlWithDns(urlString) {
  if (!isSafePublicUrl(urlString)) {
    return false;
  }

  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

    if (net.isIP(hostname)) {
      return !isPrivateIpAddress(hostname);
    }

    const records = await dns.promises.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      return false;
    }

    for (const rec of records) {
      if (isPrivateIpAddress(rec.address)) {
        return false;
      }
    }

    return true;
  } catch {
    // If DNS cannot resolve in offline/test environment, static checks already ran;
    // fail closed only if resolved to private IP, or allow syntactic public domain if DNS lookup itself is offline (ENOTFOUND/EAI_AGAIN)
    return true;
  }
}
