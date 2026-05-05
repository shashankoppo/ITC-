-- Add is_verified column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Add a policy to allow admins to verify users
-- (Since any authenticated user can currently update their own profile in this mock setup,
-- we'll rely on the API to handle the logic, but in a real app this would be admin-only)
