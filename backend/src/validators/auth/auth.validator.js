import { body } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware.js';
import { isDisposableEmail } from '../../utils/emailValidator.js';

export const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Full name must be between 2 and 120 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail()
    .custom((value) => {
      if (isDisposableEmail(value)) {
        throw new Error('অস্থায়ী বা ফেক ইমেইল (disposable email) গ্রহণযোগ্য নয়। অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা ব্যবহার করুন।');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one digit'),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(?:\+?88|01)?\d{11}$/)
    .withMessage('Please enter a valid mobile number'),
  body('languagePreference')
    .optional()
    .isIn(['bn', 'en', 'auto'])
    .withMessage('Invalid language preference'),
  validate,
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

export const verifyEmailValidator = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  validate,
];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  validate,
];

export const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one digit'),
  validate,
];

export const resendVerificationValidator = forgotPasswordValidator;
