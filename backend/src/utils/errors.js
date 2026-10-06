export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export class AccountRequiredError extends AppError {
  constructor(message = 'Account required after 5 complaints') {
    super(message, 403, 'ACCOUNT_REQUIRED');
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor(message = 'Email verification required') {
    super(message, 403, 'EMAIL_NOT_VERIFIED');
  }
}

export class ComplaintLimitReachedError extends AppError {
  constructor(message = 'Complaint limit reached') {
    super(message, 403, 'COMPLAINT_LIMIT_REACHED');
  }
}

export class CorrectionLimitReachedError extends AppError {
  constructor(message = 'Correction limit reached (maximum 3 requests allowed)') {
    super(message, 400, 'CORRECTION_LIMIT_REACHED');
  }
}

export class ConflictOfInterestError extends AppError {
  constructor(message = 'Reviewer has declared a conflict of interest for this complaint') {
    super(message, 403, 'CONFLICT_OF_INTEREST');
  }
}
