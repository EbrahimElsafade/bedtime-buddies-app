
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StoryOptions = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<string[]>([
    "sleeping",
    "religious", 
    "developmental",
    "entertainment"
  ]);
  
  const [languages, setLanguages] = useState<string[]>([
    "en",
    "ar",
    "fr"
  ]);
  
  const [newCategory, setNewCategory] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // Load from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('storyCategories');
    const savedLanguages = localStorage.getItem('storyLanguages');
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    
    if (savedLanguages) {
      setLanguages(JSON.parse(savedLanguages));
    }
  }, []);

  // Save to localStorage whenever categories or languages change
  useEffect(() => {
    localStorage.setItem('storyCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('storyLanguages', JSON.stringify(languages));
  }, [languages]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      toast({
        title: t('admin.storyOptions.categoryAdded'),
        description: t('admin.storyOptions.categoryAddedDesc', { category: newCategory.trim() }),
      });
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
    toast({
      title: t('admin.storyOptions.categoryRemoved'),
      description: t('admin.storyOptions.categoryRemovedDesc', { category: categoryToRemove }),
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
      toast({
        title: t('admin.storyOptions.languageAdded'),
        description: t('admin.storyOptions.languageAddedDesc', { language: newLanguage.trim() }),
      });
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(lang => lang !== languageToRemove));
    toast({
      title: t('admin.storyOptions.languageRemoved'),
      description: t('admin.storyOptions.languageRemovedDesc', { language: languageToRemove }),
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.storyOptions.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.storyOptions.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {t('admin.storyOptions.categories')}
            </CardTitle>
            <CardDescription>
              {t('admin.storyOptions.categoriesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('admin.storyOptions.addCategoryPlaceholder')}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <Button onClick={addCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeCategory(category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {t('admin.storyOptions.languages')}
            </CardTitle>
            <CardDescription>
              {t('admin.storyOptions.languagesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('admin.storyOptions.addLanguagePlaceholder')}
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              />
              <Button onClick={addLanguage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <Badge key={language} variant="secondary" className="flex items-center gap-1">
                  {language}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeLanguage(language)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryOptions;
