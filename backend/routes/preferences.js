import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/preferences - Get current user's preferences
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: preferences, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (error) {
      // If no preferences yet, return defaults
      return res.json({
        user_id: req.userId,
        min_age: 18,
        max_age: 65,
        interested_in: 'all',
        distance_radius: 50,
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/preferences - Create or update preferences
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { minAge, maxAge, interestedIn, distanceRadius } = req.body;

    // Check if preferences exist
    const { data: existingPrefs } = await supabase
      .from('preferences')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    const prefsData = {
      user_id: req.userId,
      min_age: minAge || 18,
      max_age: maxAge || 65,
      interested_in: interestedIn || 'all',
      distance_radius: distanceRadius || 50,
      updated_at: new Date(),
    };

    let result;
    if (existingPrefs) {
      result = await supabase
        .from('preferences')
        .update(prefsData)
        .eq('user_id', req.userId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('preferences')
        .insert([prefsData])
        .select()
        .single();
    }

    if (result.error) {
      return res.status(500).json({ error: 'Failed to save preferences' });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
