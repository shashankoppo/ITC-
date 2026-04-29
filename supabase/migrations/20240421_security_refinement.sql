-- MP MARKET DATABASE REFINEMENT & SECURITY POLICIES
-- Implementation of industry-standard RLS and Storage access

-- 1. Create Storage Bucket for Product Images
-- Note: Run this in the Supabase Dashboard/SQL Editor if not already present
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- 2. Storage Policies for Product Images
CREATE POLICY "Public Access to Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Authenticated Users can upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Users can update/delete their own images" 
ON storage.objects FOR ALL 
TO authenticated 
USING (auth.uid() = owner);

-- 3. Enhance RLS for Profiles
-- Ensure users can only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. Admin Privileges Enforcement
-- Ensure only admins can create/update categories
CREATE POLICY "Only admins can manage categories" 
ON public.categories FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 5. Product Views Function
-- Industry best practice: use a DB function for view increments to avoid race conditions
CREATE OR REPLACE FUNCTION increment_product_view(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET views_count = views_count + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
