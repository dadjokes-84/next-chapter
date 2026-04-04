import express from 'express';
import multer from 'multer';
import { uploadPhoto, deletePhoto, reorderPhotos } from '../controllers/photosController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All photo routes require authentication
router.use(authenticate);

// Upload photo
router.post('/:userId/photos', upload.single('file'), uploadPhoto);

// Delete photo by index
router.delete('/:userId/photos/:photoIndex', deletePhoto);

// Reorder photos
router.put('/:userId/photos', reorderPhotos);

export default router;
