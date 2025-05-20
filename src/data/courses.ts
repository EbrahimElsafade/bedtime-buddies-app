
export type Course = {
  id: string;
  title: string;
  description: string;
  category: 'language' | 'math' | 'science' | 'arts' | 'social';
  ageRange: string; // e.g. "3-5", "6-8", "9-12"
  duration: number; // in minutes
  lessons: number; // number of lessons
  coverImage: string;
  isFeatured: boolean;
  isFree: boolean;
};

export const courses: Course[] = [
  {
    id: 'alphabet-adventure',
    title: 'Alphabet Adventure',
    description: 'Join our fun journey through the alphabet! Learn letters, sounds, and words with colorful characters.',
    category: 'language',
    ageRange: '3-5',
    duration: 120,
    lessons: 26,
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000',
    isFeatured: true,
    isFree: true
  },
  {
    id: 'counting-carnival',
    title: 'Counting Carnival',
    description: 'Step right up to the Counting Carnival! Learn numbers 1-20 with fun games and activities.',
    category: 'math',
    ageRange: '3-5',
    duration: 90,
    lessons: 10,
    coverImage: 'https://images.unsplash.com/photo-1602619075660-15dc4d670860?q=80&w=1000',
    isFeatured: true,
    isFree: false
  },
  {
    id: 'space-explorers',
    title: 'Space Explorers',
    description: 'Blast off into space and learn about planets, stars, and astronauts in this exciting adventure!',
    category: 'science',
    ageRange: '6-8',
    duration: 150,
    lessons: 12,
    coverImage: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1000',
    isFeatured: false,
    isFree: false
  },
  {
    id: 'animal-kingdom',
    title: 'Animal Kingdom',
    description: 'Discover amazing animals from around the world! Learn about habitats, diets, and fun animal facts.',
    category: 'science',
    ageRange: '4-7',
    duration: 120,
    lessons: 15,
    coverImage: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=1000',
    isFeatured: true,
    isFree: false
  },
  {
    id: 'colors-and-shapes',
    title: 'Colors and Shapes',
    description: 'A rainbow of fun! Learn colors, shapes, and patterns through playful activities.',
    category: 'arts',
    ageRange: '2-4',
    duration: 60,
    lessons: 8,
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000',
    isFeatured: false,
    isFree: true
  },
  {
    id: 'musical-adventures',
    title: 'Musical Adventures',
    description: 'Explore the world of music through fun songs, instrument discovery, and rhythm games!',
    category: 'arts',
    ageRange: '3-6',
    duration: 75,
    lessons: 9,
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000',
    isFeatured: false,
    isFree: true
  },
  {
    id: 'creative-storytelling',
    title: 'Creative Storytelling',
    description: 'Build imagination and language skills by creating your own stories with guided prompts and illustrations.',
    category: 'language',
    ageRange: '5-8',
    duration: 110,
    lessons: 12,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
    isFeatured: false,
    isFree: false
  },
  {
    id: 'world-cultures',
    title: 'World Cultures',
    description: 'Travel the globe and learn about different cultures, traditions, foods, and celebrations!',
    category: 'social',
    ageRange: '5-9',
    duration: 130,
    lessons: 14,
    coverImage: 'https://images.unsplash.com/photo-1526299977869-7ab2f06c2c8f?q=80&w=1000',
    isFeatured: false,
    isFree: false
  },
  {
    id: 'nature-explorers',
    title: 'Nature Explorers',
    description: 'Discover the wonders of plants, insects, and outdoor environments through guided explorations.',
    category: 'science',
    ageRange: '4-7',
    duration: 95,
    lessons: 10,
    coverImage: 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=1000',
    isFeatured: false,
    isFree: true
  },
  {
    id: 'friendship-skills',
    title: 'Friendship Skills',
    description: 'Learn important social skills like sharing, taking turns, and resolving conflicts through stories and activities.',
    category: 'social',
    ageRange: '3-6',
    duration: 80,
    lessons: 8,
    coverImage: 'https://images.unsplash.com/photo-1581578017093-cd30fce4ecd7?q=80&w=1000',
    isFeatured: false,
    isFree: true
  }
];

export const getFeaturedCourses = (): Course[] => {
  return courses.filter(course => course.isFeatured);
};

export const getFreeCourses = (): Course[] => {
  return courses.filter(course => course.isFree);
};

export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

export const getCoursesByCategory = (category: Course['category']): Course[] => {
  return courses.filter(course => course.category === category);
};
