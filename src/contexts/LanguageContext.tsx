
import { createContext, useState, useContext, ReactNode } from "react";

type Language = 'en' | 'ar' | 'fr';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    'hero.title': 'Sweet Dreams Begin with Magical Stories',
    'hero.subtitle': 'Discover soothing bedtime stories in multiple languages that will take your child on magical adventures while preparing them for peaceful sleep.',
    'hero.exploreButton': 'Explore Stories',
    'hero.signUpButton': 'Sign Up Free',
    'free.story': 'Free Story of the Day',
    'free.viewAll': 'View All',
    'featured.title': 'Featured Stories',
    'features.title': 'Why Parents & Kids Love Us',
    'features.subtitle': 'Our stories are crafted to bring families together with calming narratives, educational themes, and a touch of magic.',
    'features.soothing.title': 'Soothing Stories',
    'features.soothing.desc': 'Calming narratives specially crafted to help children relax and prepare for sleep.',
    'features.languages.title': 'Multiple Languages',
    'features.languages.desc': 'Stories available in English, Arabic, and French to support language development.',
    'features.games.title': 'Family Games',
    'features.games.desc': 'Fun interactive activities that parents and children can enjoy together before bedtime.',
    'subscribe.title': 'Unlock Premium Stories & Features',
    'subscribe.subtitle': 'Get unlimited access to our full library of stories, exclusive content, and special features with our premium subscription.',
    'subscribe.button': 'See Plans',
    'nav.home': 'Home',
    'nav.stories': 'Stories',
    'nav.games': 'Games',
    'duration': 'mins',
    'button.readStory': 'Read Story',
    'button.readNow': 'Read Now',
    'button.premium': 'Premium Story',
  },
  ar: {
    'hero.title': 'تبدأ الأحلام الجميلة بقصص سحرية',
    'hero.subtitle': 'اكتشف قصص ما قبل النوم المهدئة بلغات متعددة التي ستأخذ طفلك في مغامرات سحرية أثناء الاستعداد للنوم بسلام.',
    'hero.exploreButton': 'استكشاف القصص',
    'hero.signUpButton': 'التسجيل مجانًا',
    'free.story': 'قصة اليوم المجانية',
    'free.viewAll': 'عرض الكل',
    'featured.title': 'القصص المميزة',
    'features.title': 'لماذا يحبنا الآباء والأطفال',
    'features.subtitle': 'تم تصميم قصصنا لتجمع العائلات معًا بسرديات مهدئة ومواضيع تعليمية ولمسة من السحر.',
    'features.soothing.title': 'قصص مهدئة',
    'features.soothing.desc': 'سرديات مهدئة مصممة خصيصًا لمساعدة الأطفال على الاسترخاء والاستعداد للنوم.',
    'features.languages.title': 'لغات متعددة',
    'features.languages.desc': 'قصص متوفرة باللغات الإنجليزية والعربية والفرنسية لدعم تطوير اللغة.',
    'features.games.title': 'ألعاب عائلية',
    'features.games.desc': 'أنشطة تفاعلية ممتعة يمكن للآباء والأطفال الاستمتاع بها معًا قبل النوم.',
    'subscribe.title': 'افتح القصص والميزات المميزة',
    'subscribe.subtitle': 'احصل على وصول غير محدود إلى مكتبتنا الكاملة من القصص، والمحتوى الحصري، والميزات الخاصة مع اشتراكنا المميز.',
    'subscribe.button': 'رؤية الخطط',
    'nav.home': 'الرئيسية',
    'nav.stories': 'القصص',
    'nav.games': 'الألعاب',
    'duration': 'دقائق',
    'button.readStory': 'قراءة القصة',
    'button.readNow': 'اقرأ الآن',
    'button.premium': 'قصة مميزة',
  },
  fr: {
    'hero.title': 'Les beaux rêves commencent par des histoires magiques',
    'hero.subtitle': 'Découvrez des histoires apaisantes pour le coucher en plusieurs langues qui emmèneront votre enfant dans des aventures magiques tout en le préparant à un sommeil paisible.',
    'hero.exploreButton': 'Explorer les histoires',
    'hero.signUpButton': 'Inscription gratuite',
    'free.story': 'Histoire gratuite du jour',
    'free.viewAll': 'Voir tout',
    'featured.title': 'Histoires en vedette',
    'features.title': 'Pourquoi les parents et les enfants nous adorent',
    'features.subtitle': 'Nos histoires sont conçues pour rassembler les familles avec des récits apaisants, des thèmes éducatifs et une touche de magie.',
    'features.soothing.title': 'Histoires apaisantes',
    'features.soothing.desc': 'Récits apaisants spécialement conçus pour aider les enfants à se détendre et à se préparer au sommeil.',
    'features.languages.title': 'Langues multiples',
    'features.languages.desc': 'Histoires disponibles en anglais, arabe et français pour soutenir le développement du langage.',
    'features.games.title': 'Jeux familiaux',
    'features.games.desc': 'Activités interactives amusantes que les parents et les enfants peuvent apprécier ensemble avant le coucher.',
    'subscribe.title': 'Débloquez des histoires et des fonctionnalités premium',
    'subscribe.subtitle': 'Accédez sans limite à notre bibliothèque complète d\'histoires, à du contenu exclusif et à des fonctionnalités spéciales avec notre abonnement premium.',
    'subscribe.button': 'Voir les plans',
    'nav.home': 'Accueil',
    'nav.stories': 'Histoires',
    'nav.games': 'Jeux',
    'duration': 'mins',
    'button.readStory': 'Lire l\'histoire',
    'button.readNow': 'Lire maintenant',
    'button.premium': 'Histoire premium',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
