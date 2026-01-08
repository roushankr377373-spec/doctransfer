-- Add remove_branding column to branding_settings table
ALTER TABLE branding_settings 
ADD COLUMN IF NOT EXISTS remove_branding BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow reading this column (usually handled by selecting *, but good to be safe if specific columns were restricted, though standard RLS is usually row-based)
-- The existing policies for branding_settings likely allow SELECT for everyone (for public view) and UPDATE for owner.

-- Verify column addition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'branding_settings' AND column_name = 'remove_branding';
