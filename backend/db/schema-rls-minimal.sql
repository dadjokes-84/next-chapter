-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_user_id ON swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_limits_user_id ON daily_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_limits_date ON daily_limits(date);
