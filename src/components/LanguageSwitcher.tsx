
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('misc');
  const { setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const changeLanguage = (language: string) => {
    // Update both i18next and LanguageContext
    i18n.changeLanguage(language);
    setLanguage(language as 'en' | 'ar' | 'fr');
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" >
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">{t('accessibility.languageSelection')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-secondary/90 backdrop-blur-md">
        <DropdownMenuItem 
          className={i18n.language === 'en' ? 'font-bold' : ''} 
          onClick={() => changeLanguage('en')}
        >
          {t('languages.english')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={i18n.language === 'ar' ? 'font-bold' : ''} 
          onClick={() => changeLanguage('ar')}
        >
          {t('languages.arabic')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={i18n.language === 'fr' ? 'font-bold' : ''} 
          onClick={() => changeLanguage('fr')}
        >
          {t('languages.french')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
