
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">Language Selection</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/90 dark:bg-nightsky-light/90 backdrop-blur-md">
        <DropdownMenuItem 
          className={language === 'en' ? 'font-bold' : ''} 
          onClick={() => { setLanguage('en'); setOpen(false); }}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={language === 'ar' ? 'font-bold' : ''} 
          onClick={() => { setLanguage('ar'); setOpen(false); }}
        >
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={language === 'fr' ? 'font-bold' : ''} 
          onClick={() => { setLanguage('fr'); setOpen(false); }}
        >
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
