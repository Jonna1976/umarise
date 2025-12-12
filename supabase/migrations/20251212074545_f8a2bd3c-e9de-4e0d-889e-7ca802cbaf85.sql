-- Add user_note field for personal context
ALTER TABLE public.pages ADD COLUMN user_note TEXT;

-- Add primary_keyword field for highlighted keyword
ALTER TABLE public.pages ADD COLUMN primary_keyword TEXT;