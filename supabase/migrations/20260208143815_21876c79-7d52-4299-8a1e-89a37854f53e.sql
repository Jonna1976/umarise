-- Create storage bucket for tiny thumbnails (visual fallback when IndexedDB is cleared)
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view thumbnails (they're tiny, no PII)
CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Device users can upload their own thumbnails (path = device_user_id/mark_id.jpg)
CREATE POLICY "Users can upload their own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails');

-- Users can update their own thumbnails
CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails');