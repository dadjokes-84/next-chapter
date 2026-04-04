import { supabase } from '../utils/supabase.js';

/**
 * GET /api/messages/:matchId
 * Fetch all messages for a match; verify user is a participant; mark unread as read.
 */
export async function getMessages(req, res) {
  const { matchId } = req.params;
  const userId = req.userId;

  try {
    // Verify user is part of this match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1_id !== userId && match.user2_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    // Fetch all messages for this match
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Mark unread messages (sent to this user) as read
    const unreadIds = (messages || [])
      .filter((m) => m.to_user_id === userId && !m.read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadIds);
    }

    // Determine partner id and fetch their profile
    const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;

    const { data: partner } = await supabase
      .from('profiles')
      .select('id, name, photo_url')
      .eq('id', partnerId)
      .single();

    // Fetch today's message count for free-tier badge
    const today = new Date().toISOString().split('T')[0];
    const { data: limitRow } = await supabase
      .from('message_limits')
      .select('messages_today')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Determine if user has an active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const isPaid = !!sub;
    const messagesUsedToday = limitRow?.messages_today ?? 0;

    return res.json({
      messages: messages || [],
      partner: partner || null,
      isPaid,
      messagesUsedToday,
      dailyLimit: 10,
    });
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/messages/:matchId
 * Send a message. Enforces 10/day cap for free users.
 */
export async function sendMessage(req, res) {
  const { matchId } = req.params;
  const userId = req.userId;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Verify user is part of this match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1_id !== userId && match.user2_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
    }

    const toUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

    // Check subscription status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const isPaid = !!sub;

    if (!isPaid) {
      // Enforce daily limit
      const today = new Date().toISOString().split('T')[0];

      const { data: limitRow } = await supabase
        .from('message_limits')
        .select('id, messages_today')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      const usedToday = limitRow?.messages_today ?? 0;

      if (usedToday >= 10) {
        return res.status(429).json({
          error: 'Daily message limit reached',
          message: 'Free accounts can send 10 messages per match per day. Upgrade for unlimited messaging.',
          messagesUsedToday: usedToday,
          dailyLimit: 10,
        });
      }

      // Update message_limits (upsert)
      if (limitRow) {
        await supabase
          .from('message_limits')
          .update({ messages_today: usedToday + 1 })
          .eq('id', limitRow.id);
      } else {
        await supabase
          .from('message_limits')
          .insert({ match_id: matchId, user_id: userId, date: today, messages_today: 1 });
      }
    }

    // Insert the message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        from_user_id: userId,
        to_user_id: toUserId,
        content: content.trim(),
        read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(201).json({ message });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
