-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

-- SIMPLE POLICIES FIRST - no complex subqueries

-- Users table
CREATE POLICY "Users can view their own user record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own user record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Profiles - allow all to view (public)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Preferences
CREATE POLICY "Users view own preferences"
  ON preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own preferences"
  ON preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own preferences"
  ON preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Matches - SIMPLIFIED (no complex logic yet)
CREATE POLICY "Users view own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Swipes
CREATE POLICY "Users view own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Messages - SIMPLIFIED
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id);

-- Subscriptions
CREATE POLICY "Users view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily limits
CREATE POLICY "Users view own limits"
  ON daily_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert limits"
  ON daily_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update limits"
  ON daily_limits FOR UPDATE
  USING (auth.uid() = user_id);

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
