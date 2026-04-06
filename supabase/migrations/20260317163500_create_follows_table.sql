
-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
