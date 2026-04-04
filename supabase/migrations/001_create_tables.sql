-- Next-Chapter Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT,
  bio TEXT,
  location VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  selfie_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  num_kids INT,
  kids_ages TEXT, -- "5,7,10"
  kids_genders TEXT, -- "M,F,M" (optional)
  looking_for VARCHAR(50), -- "relationship", "casual", "friendship"
  interests TEXT[], -- ["cooking", "hiking", "reading"]
  photo_urls TEXT[], -- array of photo URLs from storage
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- "pending", "accepted", "rejected", "blocked"
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Swipes Table (Like/Dislike History)
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(20), -- "like" or "pass"
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, swiped_user_id)
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50), -- "active", "canceled", "past_due"
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Message Limits Table (Track Daily Limits)
CREATE TABLE IF NOT EXISTS message_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  messages_today INT DEFAULT 0,
  reset_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 day',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
