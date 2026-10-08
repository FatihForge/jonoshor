import { body, param, query } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware.js';

export const updateJoinUsStatusValidator = [
  param('id').isMongoId().withMessage('Invalid Join Us submission ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['submitted', 'reviewed', 'accepted', 'rejected'])
    .withMessage('Invalid status. Allowed values: submitted, reviewed, accepted, rejected'),
  body('adminNotes')
    .optional()
    .trim(),
  validate,
];

export const addJoinUsNoteValidator = [
  param('id').isMongoId().withMessage('Invalid Join Us submission ID format'),
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Note must be between 2 and 2000 characters'),
  validate,
];

export const updateJoinUsNoteValidator = [
  param('id').isMongoId().withMessage('Invalid Join Us submission ID format'),
  param('noteId').isMongoId().withMessage('Invalid note ID format'),
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Updated note content is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Note must be between 2 and 2000 characters'),
  validate,
];

export const deleteJoinUsValidator = [
  param('id').isMongoId().withMessage('Invalid Join Us submission ID format'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Deletion reason is mandatory for deleting Join Us submissions')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  validate,
];

export const listJoinUsValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status')
    .optional()
    .isIn(['submitted', 'reviewed', 'accepted', 'rejected'])
    .withMessage('Invalid status filter'),
  validate,
];
