import { ENV } from './env.js';

export const storageConfig = {
  provider: 'google-drive',
  clientId: ENV.GOOGLE_DRIVE_CLIENT_ID,
  clientSecret: ENV.GOOGLE_DRIVE_CLIENT_SECRET,
  redirectUri: ENV.GOOGLE_DRIVE_REDIRECT_URI,
  refreshToken: ENV.GOOGLE_DRIVE_REFRESH_TOKEN,
  rootFolderId: ENV.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  quarantineFolderId: ENV.GOOGLE_DRIVE_QUARANTINE_FOLDER_ID,
  cleanFolderId: ENV.GOOGLE_DRIVE_CLEAN_FOLDER_ID,
  publicFolderId: ENV.GOOGLE_DRIVE_PUBLIC_FOLDER_ID,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
};
