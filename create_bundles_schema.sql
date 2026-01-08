-- Create Document Bundles Table
CREATE TABLE IF NOT EXISTS public.document_bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Changed from UUID REFERENCES auth.users(id) to support Clerk IDs
    name TEXT NOT NULL,
    share_link TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Bundle-level settings (inherited by docs if not overridden, but mainly for access control)
    password TEXT, -- Hash
    expires_at TIMESTAMP WITH TIME ZONE,
    require_biometric BOOLEAN DEFAULT false,
    require_email_verification BOOLEAN DEFAULT false,
    allowed_email TEXT
);

-- Add RLS Policies for Bundles
ALTER TABLE public.document_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Bundle Creation" 
ON public.document_bundles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own bundles" 
ON public.document_bundles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view bundles via share link" 
ON public.document_bundles FOR SELECT 
TO anon, authenticated
USING (true); -- Filtered by query in app usually, but public link needs access

-- Update Documents Table to link to Bundles
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES public.document_bundles(id) ON DELETE CASCADE;

-- Create Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_bundle_id ON public.documents(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundles_share_link ON public.document_bundles(share_link);
