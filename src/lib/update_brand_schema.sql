-- Add 'section' column to brand_images table to distinguish between grid and slider images
ALTER TABLE brand_images 
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'campaign';

-- Update existing rows to be 'campaign' by default
UPDATE brand_images SET section = 'campaign' WHERE section IS NULL;
