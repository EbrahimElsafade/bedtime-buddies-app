
-- Update the stories table to change title and description to JSONB for multilingual support
ALTER TABLE public.stories 
ALTER COLUMN title TYPE JSONB USING jsonb_build_object('en', title);

ALTER TABLE public.stories 
ALTER COLUMN description TYPE JSONB USING jsonb_build_object('en', description);

-- Set default values for the new JSONB columns
ALTER TABLE public.stories 
ALTER COLUMN title SET DEFAULT '{}'::jsonb;

ALTER TABLE public.stories 
ALTER COLUMN description SET DEFAULT '{}'::jsonb;
