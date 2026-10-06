import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new ValidationError('Validation failed', formatted));
  }
  next();
}
