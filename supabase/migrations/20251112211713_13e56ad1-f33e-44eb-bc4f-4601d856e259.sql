-- Create games table to store game settings
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id text NOT NULL UNIQUE,
  is_free boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Anyone can view active games
CREATE POLICY "Anyone can view active games"
ON public.games
FOR SELECT
USING (is_active = true);

-- Admins can manage games
CREATE POLICY "Admins can manage games"
ON public.games
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default game settings
INSERT INTO public.games (game_id, is_free, is_active) VALUES
  ('tic-tac-toe', true, true),
  ('hangman', true, true),
  ('memory', true, true),
  ('snake', true, true),
  ('rock-paper-scissors', true, true),
  ('choose-color', true, true),
  ('guess-number', true, true),
  ('catch-animal', true, true),
  ('puzzle', true, true),
  ('where-did-it-go', true, true),
  ('snake-ladder', false, true);