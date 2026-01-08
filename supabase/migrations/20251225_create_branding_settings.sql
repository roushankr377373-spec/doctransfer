-- Create branding_settings table
CREATE TABLE IF NOT EXISTS branding_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    logo_url TEXT,
    brand_color TEXT CHECK (brand_color ~ '^#[0-9a-fA-F]{6}$'), -- Hash+6hex validation
    site_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public read access (so anyone viewing the document can see the branding)
CREATE POLICY branding_settings_public_read ON branding_settings
    FOR SELECT USING (true);

-- 2. Owner can insert/update/delete
CREATE POLICY branding_settings_owner_all ON branding_settings
    FOR ALL USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE branding_settings IS 'Stores custom branding configuration for users (Standard/Business plans)';
