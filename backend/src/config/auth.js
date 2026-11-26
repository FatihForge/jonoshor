import { ENV } from './env.js';

function resolveCookieSameSite() {
  if (ENV.COOKIE_SAME_SITE) {
    return ENV.COOKIE_SAME_SITE;
  }

  if (ENV.NODE_ENV !== 'production') {
    return 'lax';
  }

  // In production, cross-origin SPA (Cloudflare Pages) + API (Render) requires SameSite=None + Secure
  try {
    const frontendOrigin = new URL(ENV.FRONTEND_URL).origin;
    const callbackOrigin = new URL(ENV.GOOGLE_CALLBACK_URL).origin;
    if (frontendOrigin !== callbackOrigin) {
      return 'none';
    }
  } catch {
    // Fallback safely
  }

  // Never use 'strict' on auth cookies as it strips cookies on Google OAuth top-level redirects
  return 'lax';
}

export const authConfig = {
  jwt: {
    accessTokenSecret: ENV.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: ENV.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: ENV.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: ENV.REFRESH_TOKEN_EXPIRY,
  },
  cookie: {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: resolveCookieSameSite(),
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  session: {
    secret: ENV.SESSION_SECRET,
  },
};
