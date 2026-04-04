import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMessages, sendMessage } from '../controllers/messagesController.js';

const router = Router();

// All message routes require authentication
router.get('/:matchId', authenticate, getMessages);
router.post('/:matchId', authenticate, sendMessage);

export default router;
