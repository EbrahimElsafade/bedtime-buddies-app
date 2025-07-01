
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
    'free.tag': 'FREE',
    'premium.tag': 'PREMIUM',
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
    'nav.profile': 'Profile',
    'duration': 'mins',
    'button.readStory': 'Read Story',
    'button.readNow': 'Read Now',
    'button.premium': 'Premium Story',
    'button.startLearning': 'Start Learning',
    'button.goToPremium': 'Go Premium',
    'button.backToCourses': 'Back to Courses',
    'popular.title': 'Popular Bedtime Stories',
    'entertainment.title': 'Fun Stories',
    'courses.title': 'Fun Learning Courses',
    'courses.exploreTitle': 'Learn with Fun Courses',
    'courses.lessons': 'lessons',
    'courses.years': 'years',
    'courses.searchPlaceholder': 'Search for courses...',
    'courses.allCourses': 'All Courses',
    'courses.categories.language': 'Language',
    'courses.categories.math': 'Math',
    'courses.categories.science': 'Science',
    'courses.categories.arts': 'Arts',
    'courses.categories.social': 'Social',
    'courses.noResults': 'No courses found matching your search.',
    'course.about': 'About this Course',
    'course.whatYouLearn': 'What You Will Learn',
    'course.learnPoint1': 'Fun and interactive lessons suitable for kids',
    'course.learnPoint2': 'Engaging activities to reinforce learning',
    'course.learnPoint3': 'Progress tracking to celebrate achievements',
    'course.notFound': 'Course Not Found',
    'course.notFoundDesc': 'The course you are looking for does not exist.',
    'toast.loginRequired': 'Login Required',
    'toast.pleaseLoginToStart': 'Please log in to start this course.',
    'toast.premiumRequired': 'Premium Required',
    'toast.upgradeToPremium': 'Please upgrade to premium to access this course.',
    'toast.courseStarted': 'Course Started',
    'toast.enjoyLearning': 'Enjoy learning'
  },
  ar: {
    'hero.title': 'تبدأ الأحلام الجميلة بقصص سحرية',
    'hero.subtitle': 'اكتشف قصص ما قبل النوم المهدئة بلغات متعددة التي ستأخذ طفلك في مغامرات سحرية أثناء الاستعداد للنوم بسلام.',
    'hero.exploreButton': 'استكشاف القصص',
    'hero.signUpButton': 'التسجيل مجانًا',
    'free.story': 'قصة اليوم المجانية',
    'free.viewAll': 'عرض الكل',
    'free.tag': 'مجاناً',
    'premium.tag': 'مميز',
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
    'nav.profile': 'الملف الشخصي',
    'duration': 'دقائق',
    'button.readStory': 'قراءة القصة',
    'button.readNow': 'اقرأ الآن',
    'button.premium': 'قصة مميزة',
    'button.startLearning': 'ابدأ التعلم',
    'button.goToPremium': 'احصل على الاشتراك المميز',
    'button.backToCourses': 'العودة إلى الدورات',
    'popular.title': 'قصص النوم الشائعة',
    'entertainment.title': 'قصص ممتعة',
    'courses.title': 'دورات تعليمية ممتعة',
    'courses.exploreTitle': 'تعلم مع دورات ممتعة',
    'courses.lessons': 'دروس',
    'courses.years': 'سنوات',
    'courses.searchPlaceholder': 'ابحث عن الدورات...',
    'courses.allCourses': 'جميع الدورات',
    'courses.categories.language': 'اللغة',
    'courses.categories.math': 'الرياضيات',
    'courses.categories.science': 'العلوم',
    'courses.categories.arts': 'الفنون',
    'courses.categories.social': 'الاجتماعية',
    'courses.noResults': 'لم يتم العثور على دورات مطابقة لبحثك.',
    'course.about': 'عن هذه الدورة',
    'course.whatYouLearn': 'ماذا ستتعلم',
    'course.learnPoint1': 'دروس تفاعلية وممتعة مناسبة للأطفال',
    'course.learnPoint2': 'أنشطة جذابة لتعزيز التعلم',
    'course.learnPoint3': 'تتبع التقدم للاحتفال بالإنجازات',
    'course.notFound': 'لم يتم العثور على الدورة',
    'course.notFoundDesc': 'الدورة التي تبحث عنها غير موجودة.',
    'toast.loginRequired': 'تسجيل الدخول مطلوب',
    'toast.pleaseLoginToStart': 'يرجى تسجيل الدخول لبدء هذه الدورة.',
    'toast.premiumRequired': 'الاشتراك المميز مطلوب',
    'toast.upgradeToPremium': 'يرجى الترقية إلى الاشتراك المميز للوصول إلى هذه الدورة.',
    'toast.courseStarted': 'تم بدء الدورة',
    'toast.enjoyLearning': 'استمتع بالتعلم'
  },
  fr: {
    'hero.title': 'Les beaux rêves commencent par des histoires magiques',
    'hero.subtitle': 'Découvrez des histoires apaisantes pour le coucher en plusieurs langues qui emmèneront votre enfant dans des aventures magiques tout en le préparant à un sommeil paisible.',
    'hero.exploreButton': 'Explorer les histoires',
    'hero.signUpButton': 'Inscription gratuite',
    'free.story': 'Histoire gratuite du jour',
    'free.viewAll': 'Voir tout',
    'free.tag': 'GRATUIT',
    'premium.tag': 'PREMIUM',
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
    'button.startLearning': 'Commencer à apprendre',
    'button.goToPremium': 'Passer au premium',
    'button.backToCourses': 'Retour aux cours',
    'popular.title': 'Histoires populaires pour le coucher',
    'entertainment.title': 'Histoires amusantes',
    'courses.title': 'Cours d\'apprentissage amusants',
    'courses.exploreTitle': 'Apprendre avec des cours amusants',
    'courses.lessons': 'leçons',
    'courses.years': 'ans',
    'courses.searchPlaceholder': 'Rechercher des cours...',
    'courses.allCourses': 'Tous les cours',
    'courses.categories.language': 'Langue',
    'courses.categories.math': 'Mathématiques',
    'courses.categories.science': 'Science',
    'courses.categories.arts': 'Arts',
    'courses.categories.social': 'Social',
    'courses.noResults': 'Aucun cours correspondant à votre recherche.',
    'course.about': 'À propos de ce cours',
    'course.whatYouLearn': 'Ce que vous apprendrez',
    'course.learnPoint1': 'Leçons amusantes et interactives adaptées aux enfants',
    'course.learnPoint2': 'Activités engageantes pour renforcer l\'apprentissage',
    'course.learnPoint3': 'Suivi des progrès pour célébrer les réussites',
    'course.notFound': 'Cours non trouvé',
    'course.notFoundDesc': 'Le cours que vous recherchez n\'existe pas.',
    'toast.loginRequired': 'Connexion requise',
    'toast.pleaseLoginToStart': 'Veuillez vous connecter pour commencer ce cours.',
    'toast.premiumRequired': 'Abonnement premium requis',
    'toast.upgradeToPremium': 'Veuillez passer à l\'abonnement premium pour accéder à ce cours.',
    'toast.courseStarted': 'Cours commencé',
    'toast.enjoyLearning': 'Profitez de l\'apprentissage'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    if (language === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
