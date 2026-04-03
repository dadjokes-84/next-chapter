import express from 'express';
import { getProfile, updateProfile, uploadSelfie } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// Get user's profile
router.get('/:userId', getProfile);

// Update profile
router.put('/:userId', updateProfile);

// Upload selfie for verification
router.post('/:userId/selfie', uploadSelfie);

export default router;
