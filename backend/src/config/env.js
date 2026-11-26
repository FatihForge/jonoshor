import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root, backend folder, or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to current working directory

const isTestRunner =
  process.env.NODE_ENV === 'test' ||
  process.execArgv.some((arg) => arg.startsWith('--test')) ||
  process.argv.some((arg) => arg.includes('.test.'));

const DEFAULT_DEV_SECRETS = {
  ACCESS_TOKEN_SECRET: 'dev-access-token-secret-must-be-changed-in-production',
  REFRESH_TOKEN_SECRET: 'dev-refresh-token-secret-must-be-changed-in-production',
  SESSION_SECRET: 'dev-session-secret-must-be-changed-in-production',
  CSRF_SECRET: 'dev-csrf-secret-key-32-chars-long!!',
};

export const ENV = {
  NODE_ENV: isTestRunner ? 'test' : (process.env.NODE_ENV || 'development'),
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_BASE_URL: process.env.API_BASE_URL || '/api/v1',
  TRUST_PROXY: process.env.TRUST_PROXY !== undefined ? process.env.TRUST_PROXY : '1',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || '',
  MAX_UPLOAD_FILE_SIZE_MB: parseInt(process.env.MAX_UPLOAD_FILE_SIZE_MB || '25', 10),
  STRICT_MIME_MAGIC_BYTES:
    process.env.STRICT_MIME_MAGIC_BYTES !== undefined
      ? process.env.STRICT_MIME_MAGIC_BYTES === 'true'
      : (isTestRunner ? false : (process.env.NODE_ENV || 'development') === 'production'),
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/jonoshor',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'jonoshor',
  MONGODB_DNS_FALLBACK: process.env.MONGODB_DNS_FALLBACK !== undefined
    ? process.env.MONGODB_DNS_FALLBACK === 'true'
    : (process.env.NODE_ENV || 'development') !== 'production',
  
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || DEFAULT_DEV_SECRETS.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || DEFAULT_DEV_SECRETS.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  
  SESSION_SECRET: process.env.SESSION_SECRET || DEFAULT_DEV_SECRETS.SESSION_SECRET,
  
  ARGON2_MEMORY_COST: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10),
  ARGON2_TIME_COST: parseInt(process.env.ARGON2_TIME_COST || '3', 10),
  ARGON2_PARALLELISM: parseInt(process.env.ARGON2_PARALLELISM || '4', 10),
  
  GOOGLE_DRIVE_CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
  GOOGLE_DRIVE_CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
  GOOGLE_DRIVE_REDIRECT_URI: process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:5000/api/v1/super-admin/storage/google-drive/callback',
  GOOGLE_DRIVE_REFRESH_TOKEN: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '',
  GOOGLE_DRIVE_ROOT_FOLDER_ID: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',
  GOOGLE_DRIVE_QUARANTINE_FOLDER_ID: process.env.GOOGLE_DRIVE_QUARANTINE_FOLDER_ID || '',
  GOOGLE_DRIVE_CLEAN_FOLDER_ID: process.env.GOOGLE_DRIVE_CLEAN_FOLDER_ID || '',
  GOOGLE_DRIVE_PUBLIC_FOLDER_ID: process.env.GOOGLE_DRIVE_PUBLIC_FOLDER_ID || '',

  CLAMAV_HOST: process.env.CLAMAV_HOST || '',
  CLAMAV_PORT: parseInt(process.env.CLAMAV_PORT || '3310', 10),
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
  
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/facebook/callback',
  
  EMAIL_HOST: process.env.EMAIL_HOST || 'localhost',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'JonoShor',
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'noreply@jonoshor.org',
  
  CORS_ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(o => o.trim()),
  
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  CSRF_SECRET: process.env.CSRF_SECRET || DEFAULT_DEV_SECRETS.CSRF_SECRET,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  EMAIL_VERIFICATION_URL: process.env.EMAIL_VERIFICATION_URL || 'http://localhost:3000/verify-email',
  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL || 'http://localhost:3000/reset-password',
};

export function validateProductionSecrets() {
  if (ENV.NODE_ENV !== 'production') {
    return true;
  }

  const missingOrInsecure = [];
  for (const [key, devDefault] of Object.entries(DEFAULT_DEV_SECRETS)) {
    const val = ENV[key];
    if (!val || val === devDefault || String(val).length < 16) {
      missingOrInsecure.push(key);
    }
  }

  if (missingOrInsecure.length > 0) {
    throw new Error(
      `FATAL SECURITY ERROR: Missing or insecure production secrets: ${missingOrInsecure.join(', ')}. Refusing to start.`
    );
  }

  return true;
}
