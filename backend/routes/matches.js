import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// GET /api/matches/discover - Get profiles to discover (matching current user's preferences)
router.get('/discover', authMiddleware, async (req, res) => {
  try {
    // Get current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('age, location')
      .eq('id', req.userId)
      .single();

    if (userError || !currentUser) {
      return res.status(400).json({ error: 'User profile incomplete' });
    }

    // Get current user's preferences
    const { data: prefs } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    // Get all users that current user has NOT swiped on yet
    const { data: swiped } = await supabase
      .from('swipes')
      .select('swiped_user_id')
      .eq('user_id', req.userId);

    const swipedIds = (swiped || []).map(s => s.swiped_user_id);

    // Get candidate profiles (all users except self and already swiped)
    let query = supabase
      .from('users')
      .select('id, name, age, bio, location, selfie_url, created_at')
      .neq('id', req.userId);

    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    const { data: candidates, error: candidateError } = await query.limit(10);

    if (candidateError) {
      return res.status(500).json({ error: 'Failed to fetch candidates' });
    }

    // Filter by preferences (age range, gender/looking_for)
    const filtered = candidates.filter(candidate => {
      // Age range check
      const minAge = prefs?.min_age || 18;
      const maxAge = prefs?.max_age || 65;
      if (candidate.age < minAge || candidate.age > maxAge) {
        return false;
      }

      // Location check (simple - same city/state for now)
      // You can enhance this with real distance calculation later
      if (prefs?.distance_radius && currentUser.location) {
        // For now, we'll just return all candidates
        // Distance filtering can be added with geospatial queries later
      }

      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/matches/like/:targetId - Like a profile
router.post('/like/:targetId', authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.params;

    // Record the swipe
    const { error: swikeError } = await supabase
      .from('swipes')
      .upsert({
        user_id: req.userId,
        swiped_user_id: targetId,
        action: 'like'
      });

    if (swikeError) {
      return res.status(500).json({ error: 'Failed to record swipe' });
    }

    // Check if target user also liked current user (mutual match)
    const { data: targetSwipe } = await supabase
      .from('swipes')
      .select('id')
      .eq('user_id', targetId)
      .eq('swiped_user_id', req.userId)
      .eq('action', 'like')
      .single();

    if (targetSwipe) {
      // Create match (ensure user1_id < user2_id alphabetically for uniqueness)
      const user1 = req.userId < targetId ? req.userId : targetId;
      const user2 = req.userId < targetId ? targetId : req.userId;

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert([{
          user_id: user1,
          matched_user_id: user2,
          status: 'active'
        }])
        .select()
        .single();

      if (!matchError) {
        return res.json({ match: true, message: 'It\'s a match!' });
      }
    }

    res.json({ match: false, message: 'Liked!' });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/matches/pass/:targetId - Pass on a profile
router.post('/pass/:targetId', authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.params;

    const { error } = await supabase
      .from('swipes')
      .upsert({
        user_id: req.userId,
        swiped_user_id: targetId,
        action: 'pass'
      });

    if (error) {
      return res.status(500).json({ error: 'Failed to record pass' });
    }

    res.json({ message: 'Passed' });
  } catch (error) {
    console.error('Pass error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/matches - Get all matches for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get all matches where current user is user_id
    const { data: matches1 } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'active');

    // Get all matches where current user is matched_user_id
    const { data: matches2 } = await supabase
      .from('matches')
      .select('*')
      .eq('matched_user_id', req.userId)
      .eq('status', 'active');

    const allMatches = [...(matches1 || []), ...(matches2 || [])];

    if (allMatches.length === 0) {
      return res.json([]);
    }

    // Get profile info for matched users
    const matchedIds = allMatches.map(m =>
      m.user_id === req.userId ? m.matched_user_id : m.user_id
    );

    const { data: profiles } = await supabase
      .from('users')
      .select('id, name, age, bio, location, selfie_url')
      .in('id', matchedIds);

    const enrichedMatches = allMatches.map(match => {
      const matchedUserId = match.user_id === req.userId ? match.matched_user_id : match.user_id;
      const profile = profiles.find(p => p.id === matchedUserId);
      return {
        ...match,
        matchedUser: profile
      };
    });

    console.log(`Found ${enrichedMatches.length} matches for user ${req.userId}`);
    res.json(enrichedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
