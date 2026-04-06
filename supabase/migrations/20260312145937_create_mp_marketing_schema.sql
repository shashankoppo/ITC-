/*
  # MP Marketing Database Schema
  
  ## Overview
  Complete database schema for MP Marketing - a comprehensive marketplace app for buying and selling all types of items.
  
  ## New Tables
  
  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `phone` (text) - Contact phone number
  - `location` (text) - User location
  - `bio` (text) - User bio/description
  - `is_admin` (boolean) - Admin flag
  - `rating` (numeric) - Average seller rating
  - `total_reviews` (integer) - Total reviews received
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `categories`
  Product categories for organizing listings
  - `id` (uuid, primary key)
  - `name` (text) - Category name
  - `slug` (text) - URL-friendly slug
  - `icon` (text) - Icon identifier for UI
  - `description` (text) - Category description
  - `parent_id` (uuid) - For subcategories
  - `sort_order` (integer) - Display order
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  
  ### 3. `products`
  Product listings posted by users
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles(id)
  - `category_id` (uuid) - References categories(id)
  - `title` (text) - Product title
  - `description` (text) - Full description
  - `price` (numeric) - Product price
  - `currency` (text) - Currency code (default USD)
  - `condition` (text) - new, like_new, good, fair, poor
  - `images` (jsonb) - Array of image URLs
  - `location` (text) - Product location
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `is_negotiable` (boolean) - Price negotiable flag
  - `status` (text) - active, sold, archived, pending
  - `views_count` (integer) - Number of views
  - `is_featured` (boolean) - Featured listing flag
  - `featured_until` (timestamptz) - Featured expiry date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `favorites`
  User's saved/favorite listings
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles(id)
  - `product_id` (uuid) - References products(id)
  - `created_at` (timestamptz)
  
  ### 5. `conversations`
  Chat conversations between users
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products(id)
  - `buyer_id` (uuid) - References profiles(id)
  - `seller_id` (uuid) - References profiles(id)
  - `last_message` (text) - Last message preview
  - `last_message_at` (timestamptz) - Last message timestamp
  - `created_at` (timestamptz)
  
  ### 6. `messages`
  Individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid) - References conversations(id)
  - `sender_id` (uuid) - References profiles(id)
  - `content` (text) - Message content
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)
  
  ### 7. `reviews`
  User reviews and ratings
  - `id` (uuid, primary key)
  - `reviewer_id` (uuid) - References profiles(id)
  - `reviewee_id` (uuid) - References profiles(id)
  - `product_id` (uuid) - References products(id)
  - `rating` (integer) - 1-5 stars
  - `comment` (text) - Review text
  - `created_at` (timestamptz)
  
  ### 8. `reported_items`
  Reports for inappropriate content
  - `id` (uuid, primary key)
  - `reporter_id` (uuid) - References profiles(id)
  - `product_id` (uuid) - References products(id)
  - `reason` (text) - Report reason
  - `description` (text) - Detailed description
  - `status` (text) - pending, reviewed, resolved
  - `created_at` (timestamptz)
  
  ### 9. `saved_searches`
  User's saved search criteria
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles(id)
  - `name` (text) - Search name
  - `criteria` (jsonb) - Search parameters
  - `notify_new_items` (boolean) - Notification preference
  - `created_at` (timestamptz)
  
  ## Security
  
  ### Row Level Security (RLS)
  - Enabled on all tables
  - Users can only modify their own data
  - Public read access for active products
  - Private access for messages and favorites
  - Admin users have elevated permissions
  
  ## Notes
  
  1. All tables use UUID primary keys for security
  2. Timestamps are in UTC
  3. Soft deletes used where appropriate (status fields)
  4. Indexes created on frequently queried columns
  5. Foreign key constraints maintain referential integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  location text,
  bio text,
  is_admin boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  images jsonb DEFAULT '[]'::jsonb,
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_negotiable boolean DEFAULT true,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived', 'pending')),
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, buyer_id, seller_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, product_id)
);

-- Create reported_items table
CREATE TABLE IF NOT EXISTS reported_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  criteria jsonb NOT NULL,
  notify_new_items boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Products policies
CREATE POLICY "Active products are viewable by everyone"
  ON products FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Reported items policies
CREATE POLICY "Users can view own reports"
  ON reported_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert reports"
  ON reported_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Saved searches policies
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update profile rating when new review is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings
DROP TRIGGER IF EXISTS trigger_update_user_rating ON reviews;
CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversations
DROP TRIGGER IF EXISTS trigger_update_conversation ON messages;
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Insert default categories
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
  ('Electronics', 'electronics', 'smartphone', 'Mobile phones, laptops, cameras, and other electronics', 1),
  ('Vehicles', 'vehicles', 'car', 'Cars, motorcycles, bicycles, and other vehicles', 2),
  ('Property', 'property', 'home', 'Houses, apartments, land, and commercial property', 3),
  ('Fashion', 'fashion', 'shirt', 'Clothing, shoes, accessories, and jewelry', 4),
  ('Home & Garden', 'home-garden', 'sofa', 'Furniture, appliances, and garden items', 5),
  ('Sports & Outdoors', 'sports-outdoors', 'dumbbell', 'Sports equipment, camping gear, and outdoor items', 6),
  ('Jobs', 'jobs', 'briefcase', 'Job listings and career opportunities', 7),
  ('Services', 'services', 'wrench', 'Professional services and skills', 8),
  ('Pets', 'pets', 'dog', 'Pets, pet supplies, and accessories', 9),
  ('Books & Media', 'books-media', 'book', 'Books, movies, music, and games', 10)
ON CONFLICT (slug) DO NOTHING;