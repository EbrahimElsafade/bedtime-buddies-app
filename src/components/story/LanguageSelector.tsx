
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LanguageSelectorProps {
  languages: string[];
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector = ({ languages, currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  if (languages.length <= 1) return null;

  return (
    <div className="mb-6">
      <Tabs value={currentLanguage} onValueChange={onLanguageChange}>
        <TabsList>
          {languages.includes('en') && (
            <TabsTrigger value="en">English</TabsTrigger>
          )}
          {languages.includes('ar-eg') && (
            <TabsTrigger value="ar-eg">مصري</TabsTrigger>
          )}
          {languages.includes('ar-fos7a') && (
            <TabsTrigger value="ar-fos7a">فصحى</TabsTrigger>
          )}
          {languages.includes('fr') && (
            <TabsTrigger value="fr">français</TabsTrigger>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
};
