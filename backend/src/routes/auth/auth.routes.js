import { Router } from 'express';
import { authController } from '../../controllers/auth/auth.controller.js';
import { privilegedAuthController } from '../../controllers/auth/privilegedAuth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { googleAuthController } from '../../controllers/auth/googleAuth.controller.js';
import {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../../validators/auth/auth.validator.js';

const router = Router();

// Google OAuth 2.0 routes
router.get('/google', googleAuthController.getAuthUrl);
router.get('/google/callback', googleAuthController.handleCallback);

router.post('/register', registerValidator, authController.register);
router.post('/verify-email', verifyEmailValidator, authController.verifyEmail);
router.post('/resend-verification', resendVerificationValidator, authController.resendVerification);
router.post('/login', loginValidator, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

// Privileged Admin & SuperAdmin Authentication with Mandatory 2FA
router.post('/admin/login', loginValidator, privilegedAuthController.adminLogin);
router.post('/admin/2fa/setup', privilegedAuthController.setup2FA);
router.post('/admin/2fa/verify', privilegedAuthController.verify2FA);

router.post('/super-admin/login', loginValidator, privilegedAuthController.superAdminLogin);
router.post('/super-admin/2fa/setup', privilegedAuthController.setup2FA);
router.post('/super-admin/2fa/verify', privilegedAuthController.verify2FA);

// Critical action re-authentication (requires active authentication)
router.post('/re-authenticate', authenticate, privilegedAuthController.reAuthenticate);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
