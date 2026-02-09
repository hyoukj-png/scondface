-- Add 'answer' column to reviews table if it doesn't exist
alter table public.reviews 
add column if not exists answer text;

-- Add 'answer' column to qna table if it doesn't exist
alter table public.qna 
add column if not exists answer text;

-- Notify schema cache reload (optional/implicit)
