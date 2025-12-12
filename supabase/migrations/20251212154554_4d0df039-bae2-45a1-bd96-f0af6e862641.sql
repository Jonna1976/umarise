-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects (same pattern as pages)
CREATE POLICY "Select own projects" 
ON public.projects 
FOR SELECT 
USING (true);

CREATE POLICY "Insert requires device_user_id" 
ON public.projects 
FOR INSERT 
WITH CHECK ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text) AND (length(device_user_id) >= 36));

CREATE POLICY "Update own projects" 
ON public.projects 
FOR UPDATE 
USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text));

CREATE POLICY "Delete own projects" 
ON public.projects 
FOR DELETE 
USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text));

-- Add project_id column to pages (nullable, so existing pages keep working)
ALTER TABLE public.pages 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;