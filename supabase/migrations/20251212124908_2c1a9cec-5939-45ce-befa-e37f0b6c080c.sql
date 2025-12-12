-- Add profile_type column to personality_snapshots to distinguish between voice and influences
ALTER TABLE public.personality_snapshots 
ADD COLUMN profile_type text NOT NULL DEFAULT 'voice';

-- Add constraint for valid profile types
ALTER TABLE public.personality_snapshots 
ADD CONSTRAINT valid_profile_type CHECK (profile_type IN ('voice', 'influences'));

-- Create index for faster lookups by device_user_id and profile_type
CREATE INDEX idx_personality_snapshots_device_profile 
ON public.personality_snapshots(device_user_id, profile_type);

-- Add UPDATE policy for personality_snapshots (was missing)
CREATE POLICY "Update own personality snapshots" 
ON public.personality_snapshots 
FOR UPDATE 
USING ((device_user_id IS NOT NULL) AND (device_user_id <> ''::text));