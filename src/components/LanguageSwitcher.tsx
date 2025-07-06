
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('misc');
  const [open, setOpen] = useState(false);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
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
