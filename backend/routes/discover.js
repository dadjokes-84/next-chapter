import express from 'express';
import { getCandidates, swipe, getMatches } from '../controllers/discoverController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All discover routes require authentication
router.use(authenticate);

// Get candidate profiles
router.get('/', getCandidates);

// Swipe like/pass
router.post('/swipe', swipe);

// Get matches
router.get('/matches', getMatches);

export default router;
