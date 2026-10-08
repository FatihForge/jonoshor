import { body } from 'express-validator';
import { validate } from '../../middlewares/validation.middleware.js';
import { isDisposableEmail } from '../../utils/emailValidator.js';
import { isSafePublicUrl } from '../../utils/urlValidation.js';

export const submitJoinUsValidator = [
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

  body('primaryProfession')
    .trim()
    .notEmpty()
    .withMessage('Primary profession is required'),

  body('primaryContributionRole')
    .trim()
    .notEmpty()
    .withMessage('Primary contribution role is required'),

  body('contributionDetails')
    .trim()
    .notEmpty()
    .withMessage('Contribution details are required')
    .isLength({ min: 10 })
    .withMessage('Contribution details must be at least 10 characters long'),

  // Validate reference links are safe public URLs if provided
  body('linkedin')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!isSafePublicUrl(val)) {
        throw new Error('LinkedIn link must be a valid and safe public URL (http or https)');
      }
      return true;
    }),

  body('portfolio')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!isSafePublicUrl(val)) {
        throw new Error('Portfolio link must be a valid and safe public URL (http or https)');
      }
      return true;
    }),

  body('socialLinks')
    .optional()
    .custom((val) => {
      let links = val;
      if (typeof links === 'string') {
        try {
          links = JSON.parse(links);
        } catch {
          links = links.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      if (Array.isArray(links)) {
        for (const link of links) {
          if (link && !isSafePublicUrl(link)) {
            throw new Error(`Invalid or unsafe reference URL: ${link}`);
          }
        }
      }
      return true;
    }),

  // Mandatory requirement: At least ONE meaningful professional/social reference link OR supporting document
  body().custom((_, { req }) => {
    const hasLinkedin = Boolean(req.body.linkedin && req.body.linkedin.trim());
    const hasPortfolio = Boolean(req.body.portfolio && req.body.portfolio.trim());

    let socialLinks = req.body.socialLinks;
    if (typeof socialLinks === 'string') {
      try {
        socialLinks = JSON.parse(socialLinks);
      } catch {
        socialLinks = socialLinks.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    const hasSocial = Array.isArray(socialLinks) && socialLinks.some((l) => Boolean(l && l.trim()));

    const hasFiles = Boolean(req.files && (Array.isArray(req.files) ? req.files.length > 0 : Object.keys(req.files).length > 0));

    let documents = req.body.documents;
    if (typeof documents === 'string') {
      try {
        documents = JSON.parse(documents);
      } catch {
        documents = [];
      }
    }
    const hasDocumentData = Array.isArray(documents) && documents.length > 0;

    const hasAnyReference = hasLinkedin || hasPortfolio || hasSocial;
    const hasAnyDocument = hasFiles || hasDocumentData;

    if (!hasAnyReference && !hasAnyDocument) {
      throw new Error(
        'কমপক্ষে ১টি প্রফেশনাল/সোশ্যাল রেফারেন্স লিঙ্ক (LinkedIn, Portfolio, GitHub/website) অথবা ১টি প্রমাণক ডকুমেন্ট (CV, Recommendation) প্রদান করা আবশ্যক।'
      );
    }

    return true;
  }),

  validate,
];
