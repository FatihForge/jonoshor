import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { UnauthorizedError } from '../utils/errors.js';
import { isDatabaseConnected } from '../config/database.js';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { SuperAdmin } from '../models/SuperAdmin.js';

export async function authenticate(req, _res, next) {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  // 2. Check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return next(new UnauthorizedError('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
    // Ensure both id and _id are available
    decoded._id = decoded._id || decoded.id;

    // Check account status in database if connection is available
    if (isDatabaseConnected()) {
      let account = null;
      if (decoded.accountType === 'admin') {
        account = await Admin.findById(decoded.id).select('accountStatus').lean();
      } else if (decoded.accountType === 'superAdmin') {
        account = await SuperAdmin.findById(decoded.id).select('accountStatus').lean();
      } else if (decoded.accountType === 'user') {
        account = await User.findById(decoded.id).select('accountStatus').lean();
      }
      if (account && account.accountStatus !== 'active') {
        return next(new UnauthorizedError(`Account is ${account.accountStatus}`));
      }
    }

    req.auth = decoded; // { id, _id, email, accountType, permissions, ... }
    
    // Assign role-specific accessor for convenience, and generic req.actor
    req.actor = decoded;
    req.user = decoded;
    if (decoded.accountType === 'admin') {
      req.admin = decoded;
    } else if (decoded.accountType === 'superAdmin') {
      req.superAdmin = decoded;
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired'));
    }
    return next(new UnauthorizedError('Invalid access token'));
  }
}

/**
 * Optional authentication middleware for public endpoints that can personalize responses
 */
export function optionalAuthenticate(req, _res, next) {
  let token = null;

  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
    req.auth = decoded;
    if (decoded.accountType === 'user') req.user = decoded;
    if (decoded.accountType === 'admin') req.admin = decoded;
    if (decoded.accountType === 'superAdmin') req.superAdmin = decoded;
  } catch {
    // Optional auth silently ignores invalid tokens
  }

  next();
}
