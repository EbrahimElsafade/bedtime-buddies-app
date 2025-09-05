-- Insert sample courses into the courses table with proper UUIDs
INSERT INTO public.courses (
  id,
  title,
  description,
  category,
  cover_image,
  languages,
  is_free,
  is_published,
  created_at,
  updated_at
) VALUES 
(gen_random_uuid(), 'Alphabet Adventure', 'Join our fun journey through the alphabet! Learn letters, sounds, and words with colorful characters.', 'language', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
(gen_random_uuid(), 'Counting Carnival', 'Step right up to the Counting Carnival! Learn numbers 1-20 with fun games and activities.', 'math', 'https://images.unsplash.com/photo-1602619075660-15dc4d670860?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
(gen_random_uuid(), 'Space Explorers', 'Blast off into space and learn about planets, stars, and astronauts in this exciting adventure!', 'science', 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
(gen_random_uuid(), 'Animal Kingdom', 'Discover amazing animals from around the world! Learn about habitats, diets, and fun animal facts.', 'science', 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
(gen_random_uuid(), 'Colors and Shapes', 'A rainbow of fun! Learn colors, shapes, and patterns through playful activities.', 'arts', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
(gen_random_uuid(), 'Musical Adventures', 'Explore the world of music through fun songs, instrument discovery, and rhythm games!', 'arts', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
(gen_random_uuid(), 'Creative Storytelling', 'Build imagination and language skills by creating your own stories with guided prompts and illustrations.', 'language', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
(gen_random_uuid(), 'World Cultures', 'Travel the globe and learn about different cultures, traditions, foods, and celebrations!', 'social', 'https://images.unsplash.com/photo-1526299977869-7ab2f06c2c8f?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
(gen_random_uuid(), 'Nature Explorers', 'Discover the wonders of plants, insects, and outdoor environments through guided explorations.', 'science', 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
(gen_random_uuid(), 'Friendship Skills', 'Learn important social skills like sharing, taking turns, and resolving conflicts through stories and activities.', 'social', 'https://images.unsplash.com/photo-1581578017093-cd30fce4ecd7?q=80&w=1000', ARRAY['en'], true, true, now(), now());