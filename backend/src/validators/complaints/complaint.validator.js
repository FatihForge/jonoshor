import { body } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware.js';
import { DATE_PRECISION } from '../../constants/complaintStatus.js';

const isNotDraft = (_val, { req }) => !req.body.isDraft && req.body.status !== 'draft';

export const createComplaintValidator = [
  body('category.primary')
    .if(isNotDraft)
    .trim()
    .notEmpty()
    .withMessage('Primary complaint category is required'),
  body('category.secondary')
    .optional()
    .isArray()
    .withMessage('Secondary categories must be an array'),
  body('incident.startDate')
    .if(isNotDraft)
    .notEmpty()
    .withMessage('Incident start date is required')
    .isISO8601()
    .withMessage('Valid incident date is required'),
  body('incident.endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Valid incident end date is required'),
  body('incident.description')
    .if(isNotDraft)
    .trim()
    .notEmpty()
    .withMessage('Incident description is required')
    .isLength({ min: 20 })
    .withMessage('Incident description must be at least 20 characters'),
  body('location.divisionId')
    .if(isNotDraft)
    .trim()
    .notEmpty()
    .withMessage('Division is required'),
  body('location.districtId')
    .if(isNotDraft)
    .trim()
    .notEmpty()
    .withMessage('District is required'),
  body('location.upazilaId')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('incident.datePrecision')
    .optional()
    .isIn(Object.values(DATE_PRECISION))
    .withMessage('Invalid date precision value'),
  validate,
];
