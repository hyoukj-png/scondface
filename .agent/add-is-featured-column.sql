-- Add is_featured column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add is_bestseller column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);

-- Optional: Set one product as featured for testing
-- UPDATE products SET is_featured = TRUE WHERE id = 'your-product-id-here' LIMIT 1;

-- Optional: Set one product as bestseller for testing
-- UPDATE products SET is_bestseller = TRUE WHERE id = 'your-product-id-here' LIMIT 1;
