import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireUser } from '../../middlewares/role.middleware.js';

import complaintsRoutes from './complaints.routes.js';
import { userProfileController } from '../../controllers/user/profile.controller.js';
import { userNotificationController } from '../../controllers/user/notification.controller.js';
import { userMessagingController } from '../../controllers/user/messaging.controller.js';

const router = Router();

// Enforce authentication & user account type
router.use(authenticate, requireUser);

// Profile
router.get('/profile', userProfileController.getProfile);
router.patch('/profile', userProfileController.updateProfile);

// Security Settings
router.get('/security', userProfileController.getSecurity);
router.patch('/security', userProfileController.updateSecurity);

// Complaints
router.use('/complaints', complaintsRoutes);

// Notifications
router.get('/notifications', userNotificationController.list);
router.patch('/notifications/:id/read', userNotificationController.markAsRead);

// Messages
router.get('/messages', userMessagingController.listConversations);
router.get('/messages/:conversationId', userMessagingController.getConversation);
router.post('/messages/:conversationId', userMessagingController.reply);

export default router;
