import argon2 from 'argon2';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

/**
 * Hash password using Argon2id with frozen specification parameters
 */
export async function hashPassword(plainPassword) {
  return await argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: ENV.ARGON2_MEMORY_COST,
    timeCost: ENV.ARGON2_TIME_COST,
    parallelism: ENV.ARGON2_PARALLELISM,
  });
}

/**
 * Verify password against Argon2id hash
 */
export async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}

/**
 * Generate secure random hex token
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Calculate SHA-256 hash of a buffer or string
 */
export function calculateSha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash a token with SHA-256 for secure DB storage (refresh tokens, reset tokens)
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
