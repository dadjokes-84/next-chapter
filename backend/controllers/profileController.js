import { supabase } from '../utils/supabase.js';

/**
 * Get user profile
 * GET /api/profiles/:userId
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own profile
    if (req.userId !== userId && req.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user and profile data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, age, bio, location, verified, selfie_url, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get extended profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (profile not created yet)
      throw profileError;
    }

    res.json({
      user,
      profile: profile || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

/**
 * Update user profile
 * PUT /api/profiles/:userId
 * Body: { bio, location, num_kids, kids_ages, looking_for, interests, photo_url }
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, location, num_kids, kids_ages, kids_genders, looking_for, interests, photo_url } = req.body;

    // Verify user is updating their own profile
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update user base info
    if (bio || location) {
      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update({
          bio: bio || undefined,
          location: location || undefined,
          updated_at: new Date(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) throw userError;
    }

    // Update or create extended profile
    const profileData = {
      user_id: userId,
      num_kids: num_kids || null,
      kids_ages: kids_ages || null,
      kids_genders: kids_genders || null,
      looking_for: looking_for || null,
      interests: interests || null,
      photo_url: photo_url || null,
      updated_at: new Date(),
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (profileError) throw profileError;

    res.json({
      message: 'Profile updated',
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Upload selfie for verification
 * POST /api/profiles/:userId/selfie
 * Body: { selfie_url } (base64 or URL)
 */
export const uploadSelfie = async (req, res) => {
  try {
    const { userId } = req.params;
    const { selfie_url } = req.body;

    // Verify user is uploading their own selfie
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!selfie_url) {
      return res.status(400).json({ error: 'Selfie URL is required' });
    }

    // Update user selfie
    const { data: user, error } = await supabase
      .from('users')
      .update({
        selfie_url,
        // In production, set to pending verification
        // verified: 'pending',
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Selfie uploaded',
      user: {
        id: user.id,
        selfie_url: user.selfie_url,
      },
    });
  } catch (error) {
    console.error('Upload selfie error:', error);
    res.status(500).json({ error: 'Failed to upload selfie' });
  }
};
