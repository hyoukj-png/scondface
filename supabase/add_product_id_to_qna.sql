-- Add product_id to qna table for product-specific inquiries
alter table public.qna 
add column if not exists product_id uuid references public.products(id);

-- Add index for faster lookups
create index if not exists idx_qna_product_id on public.qna(product_id);
