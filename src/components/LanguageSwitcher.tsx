
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('misc');
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const changeLanguage = (newLanguage: string) => {
    // Update both i18next and LanguageContext (which will handle URL update)
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage as 'en' | 'ar' | 'fr');
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">{t('accessibility.languageSelection')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/90 dark:bg-nightsky-light/90 backdrop-blur-md">
        <DropdownMenuItem 
          className={language === 'en' ? 'font-bold' : ''} 
          onClick={() => changeLanguage('en')}
        >
          {t('languages.english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={language === 'ar' ? 'font-bold' : ''} 
          onClick={() => changeLanguage('ar')}
        >
          {t('languages.arabic')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={language === 'fr' ? 'font-bold' : ''} 
          onClick={() => changeLanguage('fr')}
        >
          {t('languages.french')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
