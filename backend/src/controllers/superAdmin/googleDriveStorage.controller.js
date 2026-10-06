import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { googleDriveService } from '../../integrations/googleDrive/googleDrive.service.js';
import { authConfig } from '../../config/auth.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError, ValidationError } from '../../utils/errors.js';
import { auditService } from '../../services/audit/audit.service.js';

export const googleDriveStorageController = {
  /**
   * SuperAdmin initiates Google Drive authorization for dedicated storage account
   */
  async getAuthUrl(req, res, next) {
    try {
      const superAdminId = req.user?._id || req.user?.id || 'superadmin_local_dev';
      // Generate short-lived signed state token for OAuth CSRF protection
      const stateToken = jwt.sign(
        { superAdminId, purpose: 'gdrive_storage_oauth' },
        authConfig.jwt.accessTokenSecret,
        { expiresIn: '15m' }
      );

      const authUrl = googleDriveService.getAuthUrl(stateToken);

      // If browser navigation, redirect directly to Google consent screen
      if (req.accepts('html') && !req.xhr && !req.headers['accept']?.includes('application/json')) {
        return res.redirect(authUrl);
      }

      sendSuccess(res, { authUrl });
    } catch (err) {
      next(err);
    }
  },

  /**
   * OAuth 2.0 callback handling code exchange & folder initialization
   */
  async handleCallback(req, res, next) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        throw new ValidationError(`Google authorization error: ${error}`);
      }

      if (!code) {
        throw new ValidationError('Authorization code is missing from Google response');
      }

      let superAdminId = req.user?._id || req.user?.id;

      // Verify signed state token if user is not already attached from session
      if (state) {
        try {
          const decoded = jwt.verify(state, authConfig.jwt.accessTokenSecret);
          if (decoded.purpose === 'gdrive_storage_oauth') {
            superAdminId = superAdminId || decoded.superAdminId;
          }
        } catch {
          // If state verification fails and no session user, reject
          if (!superAdminId) {
            throw new UnauthorizedError('Invalid or expired OAuth state parameter');
          }
        }
      }

      // Exchange authorization code for offline refresh token
      await googleDriveService.exchangeCodeForTokens(code);

      // Auto-initialize application-managed folders
      const folders = await googleDriveService.initializeStorageFolders();

      if (superAdminId && mongoose.Types.ObjectId.isValid(superAdminId)) {
        await auditService.log({
          actorId: superAdminId,
          actorType: 'superAdmin',
          action: 'STORAGE_GOOGLE_DRIVE_AUTHORIZED',
          entity: 'StorageConfig',
          metadata: { provider: 'google-drive', folders },
        });
      }

      if (req.accepts('html') && !req.xhr && !req.headers['accept']?.includes('application/json')) {
        return res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>JonoShor — Google Drive Connected</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0b0f19; color: #f8fafc; }
              .card { background: #111827; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); max-width: 520px; text-align: center; border: 1px solid #1f2937; }
              h1 { color: #10b981; margin: 0 0 0.75rem; font-size: 1.5rem; }
              p { color: #9ca3af; line-height: 1.6; margin: 0 0 1rem; }
              .badge { display: inline-block; background: #064e3b; color: #34d399; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✓ Google Drive Connected</h1>
              <p>JonoShor evidence storage account is authorized. Offline refresh token received and application storage folders configured.</p>
              <div class="badge">Scope: drive.file | Offline Mode: Active</div>
            </div>
          </body>
          </html>
        `);
      }

      sendSuccess(res, {
        message: 'Google Drive storage account authorized successfully and application folders configured',
        provider: 'google-drive',
        folders,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Check status of Google Drive storage and folders
   */
  async getStorageStatus(req, res, next) {
    try {
      const status = {
        provider: 'google-drive',
        isConfigured: googleDriveService.isConfigured(),
        folders: {
          root: googleDriveService.rootFolderId,
          quarantine: googleDriveService.quarantineFolderId,
          clean: googleDriveService.cleanFolderId,
          public: googleDriveService.publicFolderId,
        },
      };

      sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Manually trigger creation/verification of storage folders
   */
  async initializeFolders(req, res, next) {
    try {
      const folders = await googleDriveService.initializeStorageFolders();
      sendSuccess(res, {
        message: 'Google Drive application storage folders verified successfully',
        folders,
      });
    } catch (err) {
      next(err);
    }
  },
};
