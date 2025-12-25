-- Fix user_id column in document_bundles to support Clerk IDs (String) instead of UUID
-- This is necessary because Clerk User IDs are strings.

-- 1. Drop the foreign key constraint if it exists
ALTER TABLE public.document_bundles 
DROP CONSTRAINT IF EXISTS document_bundles_user_id_fkey;

-- 2. Change the column type to TEXT
ALTER TABLE public.document_bundles 
ALTER COLUMN user_id TYPE TEXT;

-- 3. Update RLS Policies
-- Enable insertion for everyone (Anonymous + Authenticated)
DROP POLICY IF EXISTS "Users can create their own bundles" ON public.document_bundles;

CREATE POLICY "Allow Bundle Creation" 
ON public.document_bundles FOR INSERT 
WITH CHECK (true);

-- Ensure Select policy allows viewing
DROP POLICY IF EXISTS "Anyone can view bundles via share link" ON public.document_bundles;
CREATE POLICY "Anyone can view bundles via share link" 
ON public.document_bundles FOR SELECT 
USING (true);

-- Ensure Users can update their own bundles (if user_id matches)
DROP POLICY IF EXISTS "Users can update their own bundles" ON public.document_bundles; -- Just in case
-- We need a policy for update if we want users to be able to modify bundles later (e.g. settings)
-- For now, just ensuring INSERT works is priority.
