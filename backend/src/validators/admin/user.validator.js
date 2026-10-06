import { body, param, query } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware.js';
import { ACCOUNT_STATUS } from '../../constants/accountStatus.js';

export const listUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(Object.values(ACCOUNT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ACCOUNT_STATUS).join(', ')}`),
  validate,
];

export const getUserByIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  validate,
];

export const updateUserStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('status')
    .custom((val, { req }) => {
      const status = val || req.body.accountStatus;
      if (!status) {
        throw new Error('Status is required');
      }
      if (!Object.values(ACCOUNT_STATUS).includes(status)) {
        throw new Error(`Status must be one of: ${Object.values(ACCOUNT_STATUS).join(', ')}`);
      }
      return true;
    }),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  body('role')
    .not().exists()
    .withMessage('Role modifications are not allowed'),
  body('permissions')
    .not().exists()
    .withMessage('Permission modifications are not allowed'),
  body('accountType')
    .not().exists()
    .withMessage('Account type modifications are not allowed'),
  validate,
];
