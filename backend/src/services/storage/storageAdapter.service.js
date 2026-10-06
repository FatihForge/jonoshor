import crypto from 'crypto';
import { googleDriveService } from '../../integrations/googleDrive/googleDrive.service.js';
import { logger } from '../../utils/logger.js';

/**
 * StorageAdapterService provides an abstraction layer over cloud storage providers.
 * Allows replacing Google Drive with another provider (e.g. S3, MinIO) in the future
 * without altering evidence domain logic.
 */
export class StorageAdapterService {
  constructor(provider = googleDriveService) {
    this.provider = provider;
  }

  /**
   * Generates upload session metadata for evidence
   */
  async generateUploadSession({ complaintId, filename, mimeType, size }) {
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const safeFilename = (filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const driveFileId = `gdrive_${Date.now()}_${randomSuffix}`;

    // Upload endpoint on backend to receive binary/multipart and forward into Drive quarantine
    const uploadUrl = `/api/v1/user/complaints/${complaintId}/evidence/upload?fileId=${driveFileId}`;

    logger.info('Generated storage upload session', {
      complaintId,
      driveFileId,
      safeFilename,
      mimeType,
      size,
    });

    return {
      uploadUrl,
      driveFileId,
      expiresIn: 900,
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
      },
    };
  }

  /**
   * Upload file directly into Quarantine
   */
  async uploadToQuarantine({ filename, mimeType, bufferOrStream, size }) {
    return await this.provider.uploadToQuarantine({
      filename,
      mimeType,
      bufferOrStream,
      size,
    });
  }

  /**
   * Move file from Quarantine to Clean (Private Evidence) folder
   */
  async moveToClean(driveFileId) {
    logger.info('Moving storage file from quarantine to clean folder', { driveFileId });
    return await this.provider.moveToClean(driveFileId);
  }

  /**
   * Move file to Public Evidence folder
   */
  async moveToPublic(driveFileId) {
    logger.info('Moving storage file to public folder', { driveFileId });
    return await this.provider.moveToPublic(driveFileId);
  }

  /**
   * Stream file content from storage (for authenticated private access or zero-tracking public proxy)
   */
  async getFileStream(driveFileId) {
    return await this.provider.getFileStream(driveFileId);
  }

  /**
   * Delete file permanently from storage
   */
  async deleteFile(driveFileId) {
    logger.info('Deleting file from storage', { driveFileId });
    return await this.provider.deleteFile(driveFileId);
  }

  /**
   * Provider identity
   */
  getProviderName() {
    return 'google-drive';
  }
}

export const storageAdapterService = new StorageAdapterService();
