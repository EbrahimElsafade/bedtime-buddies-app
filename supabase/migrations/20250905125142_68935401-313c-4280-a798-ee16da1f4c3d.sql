-- Insert sample courses into the courses table
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
('alphabet-adventure', 'Alphabet Adventure', 'Join our fun journey through the alphabet! Learn letters, sounds, and words with colorful characters.', 'language', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
('counting-carnival', 'Counting Carnival', 'Step right up to the Counting Carnival! Learn numbers 1-20 with fun games and activities.', 'math', 'https://images.unsplash.com/photo-1602619075660-15dc4d670860?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
('space-explorers', 'Space Explorers', 'Blast off into space and learn about planets, stars, and astronauts in this exciting adventure!', 'science', 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
('animal-kingdom', 'Animal Kingdom', 'Discover amazing animals from around the world! Learn about habitats, diets, and fun animal facts.', 'science', 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
('colors-and-shapes', 'Colors and Shapes', 'A rainbow of fun! Learn colors, shapes, and patterns through playful activities.', 'arts', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
('musical-adventures', 'Musical Adventures', 'Explore the world of music through fun songs, instrument discovery, and rhythm games!', 'arts', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
('creative-storytelling', 'Creative Storytelling', 'Build imagination and language skills by creating your own stories with guided prompts and illustrations.', 'language', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
('world-cultures', 'World Cultures', 'Travel the globe and learn about different cultures, traditions, foods, and celebrations!', 'social', 'https://images.unsplash.com/photo-1526299977869-7ab2f06c2c8f?q=80&w=1000', ARRAY['en'], false, true, now(), now()),
('nature-explorers', 'Nature Explorers', 'Discover the wonders of plants, insects, and outdoor environments through guided explorations.', 'science', 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=1000', ARRAY['en'], true, true, now(), now()),
('friendship-skills', 'Friendship Skills', 'Learn important social skills like sharing, taking turns, and resolving conflicts through stories and activities.', 'social', 'https://images.unsplash.com/photo-1581578017093-cd30fce4ecd7?q=80&w=1000', ARRAY['en'], true, true, now(), now());

-- Insert sample lessons for each course
INSERT INTO public.course_lessons (
  course_id,
  title,
  description,
  lesson_order,
  duration,
  video_url,
  created_at,
  updated_at
) VALUES 
-- Alphabet Adventure lessons
('alphabet-adventure', 'Introduction to the Alphabet', 'Start your alphabet journey with this fun introduction to letters.', 1, 5, 'https://www.youtube.com/embed/hq3yfQnllfQ', now(), now()),
('alphabet-adventure', 'Letters A-D', 'Learn the first four letters of the alphabet with fun examples.', 2, 8, 'https://www.youtube.com/embed/eMOnyPxE_w8', now(), now()),
('alphabet-adventure', 'Letters E-H', 'Continue your alphabet adventure with letters E through H.', 3, 7, 'https://www.youtube.com/embed/pyKdUpJQBTY', now(), now()),

-- Counting Carnival lessons
('counting-carnival', 'Introduction to Numbers', 'Let''s get started with the wonderful world of numbers!', 1, 6, 'https://www.youtube.com/embed/IXwYdAG9wVQ', now(), now()),
('counting-carnival', 'Counting 1-5', 'Practice counting numbers 1 through 5 with fun activities.', 2, 10, 'https://www.youtube.com/embed/1h6F-YngTi0', now(), now()),

-- Space Explorers lessons
('space-explorers', 'Introduction to Space', 'Welcome to the amazing world of space exploration!', 1, 8, NULL, now(), now()),
('space-explorers', 'The Solar System', 'Learn about our solar system and all the planets.', 2, 12, NULL, now(), now()),

-- Animal Kingdom lessons
('animal-kingdom', 'African Safari', 'Explore the wildlife of Africa in this exciting lesson.', 1, 10, NULL, now(), now()),
('animal-kingdom', 'Ocean Creatures', 'Dive deep into the ocean to meet amazing sea creatures.', 2, 9, NULL, now(), now()),

-- Colors and Shapes lessons
('colors-and-shapes', 'Primary Colors', 'Learn about red, blue, and yellow - the building blocks of all colors.', 1, 6, NULL, now(), now()),
('colors-and-shapes', 'Basic Shapes', 'Discover circles, squares, triangles, and more!', 2, 7, NULL, now(), now()),

-- Musical Adventures lessons
('musical-adventures', 'Musical Instruments', 'Explore different instruments and their sounds.', 1, 8, NULL, now(), now()),
('musical-adventures', 'Rhythm and Beat', 'Learn about rhythm and how to keep a beat.', 2, 6, NULL, now(), now()),

-- Creative Storytelling lessons
('creative-storytelling', 'Story Structure', 'Learn the beginning, middle, and end of stories.', 1, 9, NULL, now(), now()),
('creative-storytelling', 'Character Creation', 'Create your own unique story characters.', 2, 11, NULL, now(), now()),

-- World Cultures lessons
('world-cultures', 'Asian Cultures', 'Explore the rich traditions of Asian countries.', 1, 12, NULL, now(), now()),
('world-cultures', 'European Festivals', 'Learn about celebrations across Europe.', 2, 10, NULL, now(), now()),

-- Nature Explorers lessons
('nature-explorers', 'Garden Discovery', 'Explore the wonderful world of plants and gardens.', 1, 7, NULL, now(), now()),
('nature-explorers', 'Forest Adventure', 'Take a journey through the forest ecosystem.', 2, 9, NULL, now(), now()),

-- Friendship Skills lessons
('friendship-skills', 'Making Friends', 'Learn how to make new friends and be a good friend.', 1, 8, NULL, now(), now()),
('friendship-skills', 'Sharing and Caring', 'Practice sharing toys and caring for others.', 2, 6, NULL, now(), now());