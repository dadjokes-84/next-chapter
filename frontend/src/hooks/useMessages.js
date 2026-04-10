import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../App';

export const useMessages = (matchId) => {
  const supabase = useSupabase();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Subscribe to real-time messages
  useEffect(() => {
    if (!matchId) return;

    // Subscribe to new messages on this match
    const subscription = supabase
      .channel(`match_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log('New message received:', payload.new);
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [matchId, supabase]);

  return { messages, setMessages, loading, error };
};
