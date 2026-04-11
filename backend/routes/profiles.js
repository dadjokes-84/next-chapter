import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadSelfie,
  uploadPhoto,
  deletePhoto,
  reorderPhotos,
  upload,
} from '../controllers/profileController.js';
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

// Photo gallery — order matters: /reorder before /:photoIndex
router.put('/:userId/photos/reorder', reorderPhotos);
router.post('/:userId/photos', upload.single('photo'), uploadPhoto);
router.delete('/:userId/photos/:photoIndex', deletePhoto);

export default router;
