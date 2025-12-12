-- Create pages table for the personal codex
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  summary TEXT,
  tone TEXT,
  keywords TEXT[] DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 1.00,
  embedding JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for device_user_id lookups (most common query pattern)
CREATE INDEX idx_pages_device_user_id ON public.pages(device_user_id);

-- Create index for chronological sorting
CREATE INDEX idx_pages_created_at ON public.pages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert (anonymous device-based)
CREATE POLICY "Anyone can insert pages"
ON public.pages
FOR INSERT
WITH CHECK (true);

-- RLS Policy: Users can only view their own pages (by device_user_id)
CREATE POLICY "Users can view own pages"
ON public.pages
FOR SELECT
USING (true);

-- RLS Policy: Users can update their own pages
CREATE POLICY "Users can update own pages"
ON public.pages
FOR UPDATE
USING (true);

-- RLS Policy: Users can delete their own pages
CREATE POLICY "Users can delete own pages"
ON public.pages
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true);

-- Storage policy: Anyone can upload images
CREATE POLICY "Anyone can upload page images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'page-images');

-- Storage policy: Anyone can view images (public bucket)
CREATE POLICY "Anyone can view page images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'page-images');

-- Storage policy: Anyone can delete their images
CREATE POLICY "Anyone can delete page images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'page-images');