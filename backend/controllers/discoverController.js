import { supabase } from '../utils/supabase.js';

/**
 * Get candidate profiles for the current user
 * GET /api/discover
 * Query params: limit (default 10)
 */
export const getCandidates = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    // Get IDs the user has already swiped on
    const { data: swipedRows, error: swipedError } = await supabase
      .from('swipes')
      .select('swiped_user_id')
      .eq('user_id', userId);

    if (swipedError) throw swipedError;

    const swipedIds = swipedRows.map((r) => r.swiped_user_id);
    swipedIds.push(userId); // exclude self

    // Fetch candidates not yet swiped
    let query = supabase
      .from('users')
      .select(
        `id, name, age, bio, location, selfie_url,
         profiles!left(num_kids, kids_ages, looking_for, interests, photo_url)`
      )
      .eq('verified', true)
      .limit(limit);

    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    const { data: candidates, error: candidatesError } = await query;
    if (candidatesError) throw candidatesError;

    res.json({ candidates: candidates || [] });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
};

/**
 * Swipe on a user (like or pass)
 * POST /api/discover/swipe
 * Body: { targetUserId, action: "like" | "pass" }
 */
export const swipe = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetUserId, action } = req.body;

    if (!targetUserId || !['like', 'pass'].includes(action)) {
      return res.status(400).json({ error: 'targetUserId and action (like|pass) are required' });
    }

    // Record the swipe (upsert in case of duplicate)
    const { error: swipeError } = await supabase
      .from('swipes')
      .upsert({ user_id: userId, swiped_user_id: targetUserId, action }, { onConflict: 'user_id,swiped_user_id' });

    if (swipeError) throw swipeError;

    // If it's a like, check for mutual match
    let matched = false;
    if (action === 'like') {
      const { data: theirSwipe, error: checkError } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('swiped_user_id', userId)
        .eq('action', 'like')
        .maybeSingle();

      if (checkError) throw checkError;

      if (theirSwipe) {
        // Mutual like — create a match (both directions for easy querying)
        const { error: matchError } = await supabase.from('matches').upsert(
          [
            { user_id: userId, matched_user_id: targetUserId, status: 'accepted' },
            { user_id: targetUserId, matched_user_id: userId, status: 'accepted' },
          ],
          { onConflict: 'user_id,matched_user_id' }
        );
        if (matchError) throw matchError;
        matched = true;
      }
    }

    res.json({ success: true, matched });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
};

/**
 * Get current user's matches
 * GET /api/discover/matches
 */
export const getMatches = async (req, res) => {
  try {
    const userId = req.userId;

    const { data: matches, error } = await supabase
      .from('matches')
      .select(
        `id, created_at,
         matched_user:matched_user_id (id, name, age, selfie_url, bio, location)`
      )
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ matches: matches || [] });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};
