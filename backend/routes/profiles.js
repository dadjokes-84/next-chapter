import express from 'express';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/profiles/user/:userId - Get profile by user ID
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, age, bio, location, verified, selfie_url, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get profile details if they exist
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    res.json({
      ...user,
      profile: profile || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profiles - Update user profile (auth required)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { age, location, bio } = req.body;

    const updateData = {};
    if (age) updateData.age = parseInt(age);
    if (location) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    updateData.updated_at = new Date();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profiles/details - Add profile details (num_kids, interests, etc.)
router.post('/details', authMiddleware, async (req, res) => {
  try {
    const { numKids, kidsAges, lookingFor, interests, photoUrl } = req.body;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    const updateData = {
      user_id: req.userId,
      num_kids: numKids || null,
      kids_ages: kidsAges || null,
      looking_for: lookingFor || null,
      interests: interests || null,
      photo_url: photoUrl || null,
    };

    let result;
    if (existingProfile) {
      // Update existing
      result = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', req.userId)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('profiles')
        .insert([updateData])
        .select()
        .single();
    }

    if (result.error) {
      return res.status(500).json({ error: 'Failed to save profile details' });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Profile details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
