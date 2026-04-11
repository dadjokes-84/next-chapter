<<<<<<< HEAD
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMessages, sendMessage } from '../controllers/messagesController.js';

const router = Router();

// All message routes require authentication
router.get('/:matchId', authenticate, getMessages);
router.post('/:matchId', authenticate, sendMessage);
=======
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id')
      .eq('to_user_id', req.userId)
      .eq('read', false);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch unread count' });
    }

    res.json({ unreadCount: messages?.length || 0 });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/messages/:matchId - Get conversation history
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify user is part of this match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const isParticipant = match.user_id === req.userId || match.matched_user_id === req.userId;
    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Mark messages as read where current user is recipient
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .eq('to_user_id', req.userId)
      .eq('read', false);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/messages - Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { matchId, content } = req.body;

    if (!matchId || !content) {
      return res.status(400).json({ error: 'Match ID and content required' });
    }

    // Verify user is part of this match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const isParticipant = match.user_id === req.userId || match.matched_user_id === req.userId;
    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Determine recipient
    const toUserId = match.user_id === req.userId ? match.matched_user_id : match.user_id;

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        match_id: matchId,
        from_user_id: req.userId,
        to_user_id: toUserId,
        content: content,
        read: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Message insert error:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054

export default router;
