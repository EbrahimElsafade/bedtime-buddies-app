-- Add subscription_start column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_start timestamp with time zone;