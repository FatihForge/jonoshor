import { ENV } from './env.js';

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
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  session: {
    secret: ENV.SESSION_SECRET,
  },
};
