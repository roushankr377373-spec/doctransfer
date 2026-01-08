-- =====================================================
-- COMPLETE DATABASE FIX - Run this in Supabase SQL Editor
-- =====================================================
-- This fixes BOTH the encryption keys issue AND the session tracking issue
-- =====================================================

-- PART 1: Fix encryption columns and RLS policies
-- =====================================================

-- Add encryption columns if they don't exist
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS encryption_key TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_file_name TEXT,
ADD COLUMN IF NOT EXISTS original_file_type TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_encrypted ON documents(is_encrypted);
CREATE INDEX IF NOT EXISTS idx_documents_share_link ON documents(share_link);

-- CRITICAL: Disable RLS temporarily to fix policies
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public Read Access" ON documents;
DROP POLICY IF EXISTS "Allow Anonymous Uploads" ON documents;
DROP POLICY IF EXISTS "Allow Updates" ON documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON documents;
DROP POLICY IF EXISTS "Enable insert for anon users" ON documents;
DROP POLICY IF EXISTS "Enable update for users based on id" ON documents;

-- Re-enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create completely open policies (for public file sharing)
CREATE POLICY "allow_all_select" ON documents
FOR SELECT USING (true);

CREATE POLICY "allow_all_insert" ON documents
FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_update" ON documents
FOR UPDATE USING (true);

CREATE POLICY "allow_all_delete" ON documents
FOR DELETE USING (true);

-- PART 2: Fix document_access_sessions table
-- =====================================================

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS document_access_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_agent TEXT,
    geolocation JSONB,
    verified_biometric BOOLEAN DEFAULT false,
    snapshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add session_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'document_access_sessions' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE document_access_sessions
        ADD COLUMN session_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;
    END IF;
END$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_doc_id ON document_access_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON document_access_sessions(session_id);

-- Enable RLS and create policies
ALTER TABLE document_access_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_sessions" ON document_access_sessions;
CREATE POLICY "allow_all_sessions" ON document_access_sessions
FOR ALL USING (true) WITH CHECK (true);

-- PART 3: Fix document_view_tracking table
-- =====================================================

CREATE TABLE IF NOT EXISTS document_view_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER DEFAULT 1,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_view_tracking_session ON document_view_tracking(session_id);

ALTER TABLE document_view_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_view_tracking" ON document_view_tracking;
CREATE POLICY "allow_all_view_tracking" ON document_view_tracking
FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show documents table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show RLS policies for documents
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'documents';

-- Show sample document with encryption info
SELECT id, name, is_encrypted,
       LENGTH(encryption_key) as key_length,
       LENGTH(encryption_iv) as iv_length,
       share_link
FROM documents
WHERE is_encrypted = true
LIMIT 5;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✓ COMPLETE DATABASE FIX APPLIED';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Fixed:';
    RAISE NOTICE '1. Encryption columns';
    RAISE NOTICE '2. RLS policies (now completely open)';
    RAISE NOTICE '3. document_access_sessions table';
    RAISE NOTICE '4. document_view_tracking table';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Upload a NEW file';
    RAISE NOTICE '2. Try downloading via share link';
    RAISE NOTICE '3. Check browser console';
    RAISE NOTICE '==========================================';
END $$;
