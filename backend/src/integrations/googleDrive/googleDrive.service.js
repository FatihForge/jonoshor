import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { storageConfig } from '../../config/storage.js';
import { logger } from '../../utils/logger.js';

export class GoogleDriveService {
  constructor() {
    this.clientId = storageConfig.clientId;
    this.clientSecret = storageConfig.clientSecret;
    this.redirectUri = storageConfig.redirectUri;
    this.refreshToken = storageConfig.refreshToken;
    this.scopes = storageConfig.scopes || ['https://www.googleapis.com/auth/drive.file'];

    this.rootFolderId = storageConfig.rootFolderId || null;
    this.quarantineFolderId = storageConfig.quarantineFolderId || null;
    this.cleanFolderId = storageConfig.cleanFolderId || null;
    this.publicFolderId = storageConfig.publicFolderId || null;

    this.oauth2Client = null;
    this.driveClient = null;
    this.initialized = false;
    this._mockStore = new Map(); // Dev/test fallback memory store

    this._setupOAuthClient();
  }

  _setupOAuthClient() {
    if (this.clientId && this.clientSecret) {
      this.oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        this.redirectUri
      );

      if (this.refreshToken) {
        this.oauth2Client.setCredentials({
          refresh_token: this.refreshToken,
        });
        this.driveClient = google.drive({ version: 'v3', auth: this.oauth2Client });
      }
    }
  }

  /**
   * Check if live Google Drive API is configured with active refresh token
   */
  isConfigured() {
    return Boolean(this.driveClient && this.refreshToken);
  }

  /**
   * Generate OAuth 2.0 authorization URL for dedicated storage account
   */
  getAuthUrl(state = '') {
    if (!this.oauth2Client) {
      this._setupOAuthClient();
    }
    if (!this.oauth2Client) {
      throw new Error('Google Drive Client ID and Client Secret must be configured in environment');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: this.scopes,
      state,
    });
  }

  /**
   * Exchange authorization code for refresh & access tokens
   */
  async exchangeCodeForTokens(code) {
    if (!this.oauth2Client) {
      this._setupOAuthClient();
    }
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    this.driveClient = google.drive({ version: 'v3', auth: this.oauth2Client });

    if (tokens.refresh_token) {
      this.refreshToken = tokens.refresh_token;
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN = tokens.refresh_token;
      this._persistRefreshTokenToEnv(tokens.refresh_token);
    }

    // Auto-initialize application-managed folders upon authorization
    await this.initializeStorageFolders();

    return tokens;
  }

  /**
   * Automatically create and structure application-managed folders:
   * JonoShor_Evidence_Root/
   *   ├── 01_Quarantine/
   *   ├── 02_Private_Evidence/
   *   └── 03_Public_Evidence/
   */
  async initializeStorageFolders() {
    if (!this.isConfigured()) {
      logger.info('Google Drive live credentials not active; using mock storage folders.');
      this.rootFolderId = 'mock_drive_root';
      this.quarantineFolderId = 'mock_quarantine_folder';
      this.cleanFolderId = 'mock_clean_folder';
      this.publicFolderId = 'mock_public_folder';
      this.initialized = true;
      return {
        rootFolderId: this.rootFolderId,
        quarantineFolderId: this.quarantineFolderId,
        cleanFolderId: this.cleanFolderId,
        publicFolderId: this.publicFolderId,
      };
    }

    try {
      // 1. Root folder
      if (!this.rootFolderId) {
        this.rootFolderId = await this._findOrCreateFolder('JonoShor_Evidence_Root');
      }

      // 2. Quarantine folder
      if (!this.quarantineFolderId) {
        this.quarantineFolderId = await this._findOrCreateFolder('01_Quarantine', this.rootFolderId);
      }

      // 3. Clean/Private folder
      if (!this.cleanFolderId) {
        this.cleanFolderId = await this._findOrCreateFolder('02_Private_Evidence', this.rootFolderId);
      }

      // 4. Public-safe folder
      if (!this.publicFolderId) {
        this.publicFolderId = await this._findOrCreateFolder('03_Public_Evidence', this.rootFolderId);
      }

      this.initialized = true;
      logger.info('Initialized application-managed Google Drive folders', {
        root: this.rootFolderId,
        quarantine: this.quarantineFolderId,
        clean: this.cleanFolderId,
        public: this.publicFolderId,
      });

      this._persistFolderIdsToEnv();

      return {
        rootFolderId: this.rootFolderId,
        quarantineFolderId: this.quarantineFolderId,
        cleanFolderId: this.cleanFolderId,
        publicFolderId: this.publicFolderId,
      };
    } catch (err) {
      logger.error('Failed to initialize Google Drive storage folders', { error: err.message });
      throw err;
    }
  }

  async _findOrCreateFolder(name, parentId = null) {
    let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const listRes = await this.driveClient.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (listRes.data.files && listRes.data.files.length > 0) {
      return listRes.data.files[0].id;
    }

    const folderMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const createRes = await this.driveClient.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return createRes.data.id;
  }

  /**
   * Upload file into Quarantine folder
   */
  async uploadToQuarantine({ filename, mimeType, bufferOrStream, size }) {
    if (!bufferOrStream || (Buffer.isBuffer(bufferOrStream) && bufferOrStream.length === 0)) {
      throw new Error('File buffer or stream is required and cannot be empty for uploadToQuarantine');
    }

    const driveFileId = `drive_${crypto.randomUUID()}`;

    if (!this.isConfigured()) {
      // Offline / Test mock implementation
      let buffer;
      if (Buffer.isBuffer(bufferOrStream)) {
        buffer = bufferOrStream;
      } else if (bufferOrStream) {
        buffer = Buffer.from(bufferOrStream);
      } else {
        buffer = Buffer.alloc(0);
      }

      this._mockStore.set(driveFileId, {
        id: driveFileId,
        filename,
        mimeType,
        buffer,
        size: size || buffer.length,
        folder: 'quarantine',
        createdAt: new Date(),
      });

      return {
        driveFileId,
        folder: 'quarantine',
        filename,
        mimeType,
        size: size || buffer.length,
      };
    }

    if (!this.quarantineFolderId) {
      await this.initializeStorageFolders();
    }

    const readable = Buffer.isBuffer(bufferOrStream)
      ? Readable.from(bufferOrStream)
      : bufferOrStream;

    const fileMetadata = {
      name: filename,
      parents: [this.quarantineFolderId],
    };

    const media = {
      mimeType,
      body: readable,
    };

    const res = await this.driveClient.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, size',
    });

    return {
      driveFileId: res.data.id,
      folder: 'quarantine',
      filename: res.data.name,
      mimeType: res.data.mimeType,
      size: parseInt(res.data.size || '0', 10),
    };
  }

  /**
   * Move file from Quarantine to Clean (Private Evidence) folder
   */
  async moveToClean(driveFileId) {
    if (!driveFileId) {
      throw new Error('driveFileId is required to move file to clean folder');
    }

    if (!this.isConfigured() || driveFileId.startsWith('gdrive_') || driveFileId.startsWith('drive_') || driveFileId.startsWith('mock_')) {
      const mock = this._mockStore.get(driveFileId) || {
        id: driveFileId,
        filename: 'mock_file',
        folder: 'quarantine',
        buffer: Buffer.from('Mock content for ' + driveFileId),
      };
      mock.folder = 'clean';
      this._mockStore.set(driveFileId, mock);
      return { driveFileId, folder: 'clean' };
    }

    try {
      if (!this.cleanFolderId || !this.quarantineFolderId) {
        await this.initializeStorageFolders();
      }

      await this.driveClient.files.update({
        fileId: driveFileId,
        addParents: this.cleanFolderId,
        removeParents: this.quarantineFolderId,
        fields: 'id, parents',
      });

      return { driveFileId, folder: 'clean' };
    } catch (err) {
      logger.error('Failed to move file to clean folder in Google Drive', { error: err.message, driveFileId });
      throw err;
    }
  }

  /**
   * Move file to Public folder
   */
  async moveToPublic(driveFileId) {
    if (!driveFileId) {
      throw new Error('driveFileId is required to move file to public folder');
    }

    if (!this.isConfigured() || driveFileId.startsWith('gdrive_') || driveFileId.startsWith('drive_') || driveFileId.startsWith('mock_')) {
      const mock = this._mockStore.get(driveFileId) || {
        id: driveFileId,
        filename: 'mock_file',
        folder: 'clean',
        buffer: Buffer.from('Mock content for ' + driveFileId),
      };
      mock.folder = 'public';
      this._mockStore.set(driveFileId, mock);
      return { driveFileId, folder: 'public' };
    }

    try {
      if (!this.publicFolderId || !this.cleanFolderId) {
        await this.initializeStorageFolders();
      }

      await this.driveClient.files.update({
        fileId: driveFileId,
        addParents: this.publicFolderId,
        removeParents: this.cleanFolderId,
        fields: 'id, parents',
      });

      return { driveFileId, folder: 'public' };
    } catch (err) {
      logger.error('Failed to move file to public folder in Google Drive', { error: err.message, driveFileId });
      throw err;
    }
  }

  /**
   * Copy file to Public folder (Preserves private original in clean/private folder)
   */
  async copyToPublic(driveFileId, newFilename = null) {
    if (!driveFileId) {
      throw new Error('driveFileId is required to copy file to public folder');
    }

    if (!this.isConfigured() || driveFileId.startsWith('gdrive_') || driveFileId.startsWith('drive_') || driveFileId.startsWith('mock_')) {
      const mock = this._mockStore.get(driveFileId) || {
        id: driveFileId,
        filename: newFilename || 'mock_file',
        folder: 'clean',
        buffer: Buffer.from('Mock content for ' + driveFileId),
      };
      const publicCopyId = `gdrive_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      this._mockStore.set(publicCopyId, {
        ...mock,
        id: publicCopyId,
        filename: newFilename || `public_${mock.filename || 'file'}`,
        folder: 'public',
      });
      return { driveFileId: publicCopyId, folder: 'public' };
    }

    try {
      if (!this.publicFolderId) {
        await this.initializeStorageFolders();
      }

      const copyMetadata = {
        parents: [this.publicFolderId],
      };
      if (newFilename) {
        copyMetadata.name = newFilename;
      }

      const res = await this.driveClient.files.copy({
        fileId: driveFileId,
        requestBody: copyMetadata,
        fields: 'id, name, parents',
      });

      return { driveFileId: res.data.id, folder: 'public' };
    } catch (err) {
      logger.error('Failed to copy file to public folder in Google Drive', { error: err.message, driveFileId });
      throw err;
    }
  }

  /**
   * Get file stream for backend proxying (Zero viewer tracking)
   */
  async getFileStream(driveFileId) {
    if (!driveFileId) {
      throw new Error('driveFileId is required to get file stream');
    }

    if (!this.isConfigured() || driveFileId.startsWith('gdrive_') || driveFileId.startsWith('drive_') || driveFileId.startsWith('mock_')) {
      const mock = this._mockStore.get(driveFileId) || {
        id: driveFileId,
        filename: 'mock_file',
        buffer: Buffer.from('Mock content for ' + driveFileId),
        mimeType: 'application/octet-stream',
        size: 24,
      };
      return {
        stream: Readable.from(mock.buffer),
        mimeType: mock.mimeType || 'application/octet-stream',
        size: mock.size || mock.buffer.length,
        filename: mock.filename || 'mock_file',
      };
    }

    try {
      // Retrieve file metadata
      const meta = await this.driveClient.files.get({
        fileId: driveFileId,
        fields: 'id, name, mimeType, size',
      });

      // Stream file content directly
      const res = await this.driveClient.files.get(
        { fileId: driveFileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return {
        stream: res.data,
        mimeType: meta.data.mimeType,
        size: parseInt(meta.data.size || '0', 10),
        filename: meta.data.name,
      };
    } catch (err) {
      logger.error('Failed to get file stream from Google Drive', { error: err.message, driveFileId });
      throw err;
    }
  }

  /**
   * Delete file permanently from Drive
   */
  async deleteFile(driveFileId) {
    if (!this.isConfigured() || !driveFileId || driveFileId.startsWith('gdrive_')) {
      this._mockStore.delete(driveFileId);
      return { success: true };
    }

    try {
      await this.driveClient.files.delete({ fileId: driveFileId });
      return { success: true };
    } catch (err) {
      if (err.code === 404 || err.status === 404 || (err.message && err.message.includes('File not found'))) {
        this._mockStore.delete(driveFileId);
        return { success: true };
      }
      throw err;
    }
  }

  /**
   * Store mock buffer directly (useful in unit/integration tests)
   */
  setMockFile(driveFileId, { buffer, mimeType, filename }) {
    this._mockStore.set(driveFileId, {
      id: driveFileId,
      filename,
      mimeType,
      buffer,
      size: buffer.length,
      folder: 'quarantine',
    });
  }

  getMockFile(driveFileId) {
    return this._mockStore.get(driveFileId);
  }

  _persistRefreshTokenToEnv(refreshToken) {
    try {
      const candidates = [
        path.resolve(process.cwd(), '../.env'),
        path.resolve(process.cwd(), '.env'),
      ];
      for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
          let content = fs.readFileSync(envPath, 'utf-8');
          if (/^GOOGLE_DRIVE_REFRESH_TOKEN=/m.test(content)) {
            content = content.replace(/^GOOGLE_DRIVE_REFRESH_TOKEN=.*$/m, `GOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}`);
          } else {
            content += `\nGOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}\n`;
          }
          fs.writeFileSync(envPath, content);
        }
      }
    } catch (err) {
      logger.warn('Could not persist refresh token to .env:', err.message);
    }
  }

  _persistFolderIdsToEnv() {
    try {
      const candidates = [
        path.resolve(process.cwd(), '../.env'),
        path.resolve(process.cwd(), '.env'),
      ];
      for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
          let content = fs.readFileSync(envPath, 'utf-8');
          if (this.rootFolderId) {
            content = content.replace(/^GOOGLE_DRIVE_ROOT_FOLDER_ID=.*$/m, `GOOGLE_DRIVE_ROOT_FOLDER_ID=${this.rootFolderId}`);
          }
          if (this.quarantineFolderId) {
            content = content.replace(/^GOOGLE_DRIVE_QUARANTINE_FOLDER_ID=.*$/m, `GOOGLE_DRIVE_QUARANTINE_FOLDER_ID=${this.quarantineFolderId}`);
          }
          if (this.cleanFolderId) {
            content = content.replace(/^GOOGLE_DRIVE_CLEAN_FOLDER_ID=.*$/m, `GOOGLE_DRIVE_CLEAN_FOLDER_ID=${this.cleanFolderId}`);
          }
          if (this.publicFolderId) {
            content = content.replace(/^GOOGLE_DRIVE_PUBLIC_FOLDER_ID=.*$/m, `GOOGLE_DRIVE_PUBLIC_FOLDER_ID=${this.publicFolderId}`);
          }
          fs.writeFileSync(envPath, content);
        }
      }
    } catch (err) {
      logger.warn('Could not persist folder IDs to .env:', err.message);
    }
  }
}

export const googleDriveService = new GoogleDriveService();
