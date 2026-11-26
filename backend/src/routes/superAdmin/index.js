import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireSuperAdmin } from '../../middlewares/role.middleware.js';
import { requireReAuth } from '../../middlewares/reAuth.middleware.js';
import { superAdminController } from '../../controllers/superAdmin/adminManagement.controller.js';
import { googleDriveStorageController } from '../../controllers/superAdmin/googleDriveStorage.controller.js';

const router = Router();

// OAuth callback accepts Google redirect (validates signed state or session)
router.get('/storage/google-drive/callback', googleDriveStorageController.handleCallback);

// Storage management endpoints strictly enforce SuperAdmin authentication across all environments
router.get('/storage/google-drive/authorize', authenticate, requireSuperAdmin, googleDriveStorageController.getAuthUrl);
router.get('/storage/google-drive/status', authenticate, requireSuperAdmin, googleDriveStorageController.getStorageStatus);
router.post('/storage/google-drive/init-folders', authenticate, requireSuperAdmin, googleDriveStorageController.initializeFolders);

// Enforce authentication & superAdmin account type for administrative endpoints
router.use(authenticate, requireSuperAdmin);

// Dashboard
router.get('/dashboard', superAdminController.getDashboard);

// Permissions List
router.get('/permissions', superAdminController.getAvailablePermissions);

// Admin Account Management
router.post('/admins', superAdminController.createAdmin);
router.get('/admins', superAdminController.listAdmins);
router.get('/admins/:id', superAdminController.getAdminById);
router.patch('/admins/:id', superAdminController.updateAdmin);
router.patch('/admins/:id/permissions', requireReAuth, superAdminController.updatePermissions);

// Security & Audit
router.get('/security/logs', superAdminController.getSecurityLogs);
router.get('/audit-logs', superAdminController.getAuditLogs);

// System Settings
router.get('/system-settings', superAdminController.getSystemSettings);
router.patch('/system-settings/:key', requireReAuth, superAdminController.updateSystemSetting);

// Financial Settings (Super Admin Only per Section 72)
router.get('/financial-settings', superAdminController.getFinancialSettings);
router.patch('/financial-settings', requireReAuth, superAdminController.updateFinancialSettings);

export default router;
