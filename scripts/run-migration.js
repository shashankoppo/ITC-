
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `
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

-- Policies (using separate DO blocks to avoid errors if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Follows are viewable by everyone') THEN
        CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can follow others') THEN
        CREATE POLICY "Users can follow others" ON follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can unfollow') THEN
        CREATE POLICY "Users can unfollow" ON follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
`;

async function main() {
    console.log('Running follows table migration...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error('Error (via RPC):', error);
        console.warn('Trying direct SQL execution if possible (often fails with anon key)...');
        // supabase-js doesn't provide a direct way to execute raw SQL from client side
        // Typically exec_sql is a custom function. If it doesn't exist, we can't run this without admin keys or CLI.
    } else {
        console.log('Follows table migration completed!');
    }
}

// NOTE: Usually 'exec_sql' doesn't exist by default. I should check if it does or use the CLI.
// Since I'm on Windows and can't use CLI easily, I'll recommend the user to run it in Supabase Dashboard.
// However, I can try to use the `supabase` client to perform some actions IF I have a way.
// For now, I'll just write the SQL and inform the user.

main();
