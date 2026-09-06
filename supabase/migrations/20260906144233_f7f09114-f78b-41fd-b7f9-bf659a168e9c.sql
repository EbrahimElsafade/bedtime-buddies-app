ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS referral_prompt_dismissed_at timestamp with time zone;