-- Update reviews table for product-linked reviews
alter table public.reviews 
add column if not exists product_id uuid references public.products(id),
add column if not exists rating integer default 5,
add column if not exists user_email text;

-- Add index for faster lookups
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_user_email on public.reviews(user_email);
