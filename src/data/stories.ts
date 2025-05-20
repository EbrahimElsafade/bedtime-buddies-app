
export type Story = {
  id: string;
  title: string;
  description: string;
  category: 'sleeping' | 'religious' | 'developmental' | 'entertainment';
  isFree: boolean;
  isFeatured: boolean;
  duration: number; // in minutes
  coverImage: string;
  languages: Array<'en' | 'ar-eg' | 'ar-fos7a'>;
  content: {
    [key in 'en' | 'ar-eg' | 'ar-fos7a']?: {
      text: string;
      scenes: {
        text: string;
        image: string;
      }[];
    };
  };
};

export const stories: Story[] = [
  {
    id: 'moonlight-adventure',
    title: 'The Moonlight Adventure',
    description: 'Join Luna as she embarks on a magical journey through the night sky, meeting stars and learning about the moon.',
    category: 'sleeping',
    isFree: true,
    isFeatured: true,
    duration: 8,
    coverImage: 'https://images.unsplash.com/photo-1532251632967-86af52cbab08?q=80&w=1000',
    languages: ['en', 'ar-eg', 'ar-fos7a'],
    content: {
      en: {
        text: 'Luna couldn\'t sleep. The full moon shone through her window, casting a gentle glow across her room...',
        scenes: [
          {
            text: 'Luna couldn\'t sleep. The full moon shone through her window, casting a gentle glow across her room.',
            image: 'https://images.unsplash.com/photo-1532251632967-86af52cbab08?q=80&w=1000'
          },
          {
            text: '"Hello, moon," Luna whispered. To her surprise, the moon whispered back! "Hello, Luna. Would you like to join me for an adventure tonight?"',
            image: 'https://images.unsplash.com/photo-1513735718075-2e2d37cb7cc1?q=80&w=1000'
          },
          {
            text: 'Luna floated out of her bed and up toward the moon. She felt light as a feather as she drifted through the night sky.',
            image: 'https://images.unsplash.com/photo-1435224668334-0f82ec57b605?q=80&w=1000'
          },
          {
            text: 'The moon introduced Luna to his friends, the twinkling stars. They sang lullabies together.',
            image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000'
          },
          {
            text: 'Luna felt her eyes growing heavy. The moon gently guided her back to her bed. "Goodnight," the moon whispered. Luna was fast asleep before she could even say goodnight back.',
            image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1000'
          }
        ]
      }
    }
  },
  {
    id: 'sleepy-bear',
    title: 'The Sleepy Bear',
    description: 'Follow the journey of a little bear preparing for winter hibernation and the friends who help along the way.',
    category: 'sleeping',
    isFree: true,
    isFeatured: false,
    duration: 6,
    coverImage: 'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?q=80&w=1000',
    languages: ['en'],
    content: {
      en: {
        text: 'Little Bear was getting ready for his winter sleep. He needed to gather enough food and make his den cozy and warm...',
        scenes: [
          {
            text: 'Little Bear was getting ready for his winter sleep. He needed to gather enough food and make his den cozy and warm.',
            image: 'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?q=80&w=1000'
          },
          {
            text: 'His friend Squirrel helped him collect nuts and berries. "These will keep you strong during your long sleep," said Squirrel.',
            image: 'https://images.unsplash.com/photo-1507666405895-422eee7d517f?q=80&w=1000'
          },
          {
            text: 'Rabbit brought soft leaves for Little Bear\'s bed. "These will keep you comfortable," smiled Rabbit.',
            image: 'https://images.unsplash.com/photo-1585094485361-301a6ab2a261?q=80&w=1000'
          },
          {
            text: 'When everything was ready, Little Bear\'s friends sang him a lullaby. His eyes grew heavy as snowflakes began to fall outside.',
            image: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?q=80&w=1000'
          },
          {
            text: 'Little Bear fell into a deep, peaceful sleep, dreaming of spring and playing with his friends again.',
            image: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?q=80&w=1000'
          }
        ]
      }
    }
  },
  {
    id: 'starlight-wishes',
    title: 'Starlight Wishes',
    description: 'Every star in the sky holds a wish. Join Mia as she discovers how wishes come true with patience and kindness.',
    category: 'developmental',
    isFree: false,
    isFeatured: true,
    duration: 10,
    coverImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000',
    languages: ['en', 'ar-eg'],
    content: {
      en: {
        text: 'Mia loved to count the stars before going to sleep. Her grandmother told her that each star held a wish...',
        scenes: [
          {
            text: 'Mia loved to count the stars before going to sleep. Her grandmother told her that each star held a wish.',
            image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000'
          },
          {
            text: '"How do wishes come true?" Mia asked her grandmother. "With patience and kindness," she replied with a smile.',
            image: 'https://images.unsplash.com/photo-1499415479124-43c32433a620?q=80&w=1000'
          },
          {
            text: 'The next day, Mia helped her neighbor carry groceries. To her surprise, her neighbor gave her a book about stars - something she had been wishing for!',
            image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?q=80&w=1000'
          },
          {
            text: '"See?" her grandmother said that night. "Your kindness helped your wish come true." Mia smiled up at the twinkling stars.',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000'
          },
          {
            text: 'As Mia drifted off to sleep, she made a new wish on the brightest star. With patience and kindness, she knew it would come true someday.',
            image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000'
          }
        ]
      }
    }
  },
  {
    id: 'brave-little-light',
    title: 'The Brave Little Light',
    description: 'A story about a small nightlight who discovers that even the smallest light can chase away the biggest darkness.',
    category: 'sleeping',
    isFree: false,
    isFeatured: false,
    duration: 7,
    coverImage: 'https://images.unsplash.com/photo-1527112862739-c3b9466d902e?q=80&w=1000',
    languages: ['en'],
    content: {
      en: {
        text: 'In a bedroom at the end of the hall lived a small nightlight named Glow. Glow was worried because he was so small...',
        scenes: [
          {
            text: 'In a bedroom at the end of the hall lived a small nightlight named Glow. Glow was worried because he was so small.',
            image: 'https://images.unsplash.com/photo-1527112862739-c3b9466d902e?q=80&w=1000'
          },
          {
            text: '"How can I keep the darkness away?" Glow wondered. "I\'m just a tiny light in a big, dark room."',
            image: 'https://images.unsplash.com/photo-1548141125-e7d3ac3423f5?q=80&w=1000'
          },
          {
            text: 'That night, a storm caused the power to go out. The whole house was dark, except for Glow\'s gentle light.',
            image: 'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?q=80&w=1000'
          },
          {
            text: '"I\'m not afraid anymore," said the little boy in the bed. "Glow is keeping me safe." Glow beamed with pride.',
            image: 'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?q=80&w=1000'
          },
          {
            text: 'From that night on, Glow understood that even the smallest light was powerful enough to chase away the darkness. And as the little boy drifted off to sleep, Glow watched over him, brave and bright.',
            image: 'https://images.unsplash.com/photo-1558674378-e4308d121679?q=80&w=1000'
          }
        ]
      }
    }
  }
];

export const getStoryById = (id: string): Story | undefined => {
  return stories.find(story => story.id === id);
};

export const getFeaturedStories = (): Story[] => {
  return stories.filter(story => story.isFeatured);
};

export const getFreeStories = (): Story[] => {
  return stories.filter(story => story.isFree);
};

export const getStoriesByCategory = (category: Story['category']): Story[] => {
  return stories.filter(story => story.category === category);
};
