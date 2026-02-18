import express from 'express';
import UserController from '../controllers/UserController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Admin routes (must come before /:userId to avoid route conflicts)
router.get('/all', UserController.getAllUsers);

// Get current user info
router.get('/me', UserController.getMe);

// Update user profile
router.put('/profile', UserController.updateProfile);

// Upload profile photo
router.post('/upload-photo', upload.single('photo'), UserController.uploadPhoto);

// Delete profile photo
router.delete('/photo', UserController.deletePhoto);

// Change password
router.post('/change-password', UserController.changePassword);

// Get user activity
router.get('/activity', UserController.getUserActivity);

// Get activity statistics
router.get('/activity/stats', UserController.getActivityStats);

// Specific user routes (must come last to avoid catching other routes)
router.get('/:userId', UserController.getUserDetails);
router.put('/:userId/status', UserController.updateUserStatus);
router.put('/:userId/role', UserController.updateUserRole);

export default router;
