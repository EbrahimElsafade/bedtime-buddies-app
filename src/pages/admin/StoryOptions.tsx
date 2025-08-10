import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type StoryCategory = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type StoryLanguage = {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
};

const StoryOptions = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newCategory, setNewCategory] = useState("");
  const [newLanguageCode, setNewLanguageCode] = useState("");
  const [newLanguageName, setNewLanguageName] = useState("");
  
  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingLanguageId, setEditingLanguageId] = useState<string | null>(null);
  const [editingLanguageCode, setEditingLanguageCode] = useState("");
  const [editingLanguageName, setEditingLanguageName] = useState("");

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('story_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StoryCategory[];
    }
  });

  // Fetch languages
  const { data: languages = [], isLoading: languagesLoading } = useQuery({
    queryKey: ['story-languages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('story_languages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StoryLanguage[];
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await (supabase as any)
        .from('story_categories')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['story-categories'] });
      setNewCategory("");
      toast({
        title: t('storyOptions.categoryAdded'),
        description: t('storyOptions.categoryAddedDesc', { category: data.name }),
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await (supabase as any)
        .from('story_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['story-categories'] });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast({
        title: "Category Updated",
        description: `Category '${data.name}' has been updated successfully`,
      });
    }
  });

  // Remove category mutation
  const removeCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('story_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      const category = categories.find(cat => cat.id === id);
      queryClient.invalidateQueries({ queryKey: ['story-categories'] });
      toast({
        title: t('storyOptions.categoryRemoved'),
        description: t('storyOptions.categoryRemovedDesc', { category: category?.name }),
      });
    }
  });

  // Add language mutation
  const addLanguageMutation = useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      const { data, error } = await (supabase as any)
        .from('story_languages')
        .insert({ code, name })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['story-languages'] });
      setNewLanguageCode("");
      setNewLanguageName("");
      toast({
        title: t('storyOptions.languageAdded'),
        description: t('storyOptions.languageAddedDesc', { language: data.name }),
      });
    }
  });

  // Update language mutation
  const updateLanguageMutation = useMutation({
    mutationFn: async ({ id, code, name }: { id: string; code: string; name: string }) => {
      const { data, error } = await (supabase as any)
        .from('story_languages')
        .update({ code, name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['story-languages'] });
      setEditingLanguageId(null);
      setEditingLanguageCode("");
      setEditingLanguageName("");
      toast({
        title: "Language Updated",
        description: `Language '${data.name}' has been updated successfully`,
      });
    }
  });

  // Remove language mutation
  const removeLanguageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('story_languages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      const language = languages.find(lang => lang.id === id);
      queryClient.invalidateQueries({ queryKey: ['story-languages'] });
      toast({
        title: t('storyOptions.languageRemoved'),
        description: t('storyOptions.languageRemovedDesc', { language: language?.name }),
      });
    }
  });

  const addCategory = () => {
    if (newCategory.trim() && !categories.some(cat => cat.name === newCategory.trim())) {
      addCategoryMutation.mutate(newCategory.trim());
    }
  };

  const startEditCategory = (category: StoryCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const saveEditCategory = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        name: editingCategoryName.trim()
      });
    }
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const removeCategory = (id: string) => {
    removeCategoryMutation.mutate(id);
  };

  const addLanguage = () => {
    if (newLanguageCode.trim() && newLanguageName.trim() && 
        !languages.some(lang => lang.code === newLanguageCode.trim())) {
      addLanguageMutation.mutate({ 
        code: newLanguageCode.trim(), 
        name: newLanguageName.trim() 
      });
    }
  };

  const startEditLanguage = (language: StoryLanguage) => {
    setEditingLanguageId(language.id);
    setEditingLanguageCode(language.code);
    setEditingLanguageName(language.name);
  };

  const saveEditLanguage = () => {
    if (editingLanguageId && editingLanguageCode.trim() && editingLanguageName.trim()) {
      updateLanguageMutation.mutate({
        id: editingLanguageId,
        code: editingLanguageCode.trim(),
        name: editingLanguageName.trim()
      });
    }
  };

  const cancelEditLanguage = () => {
    setEditingLanguageId(null);
    setEditingLanguageCode("");
    setEditingLanguageName("");
  };

  const removeLanguage = (id: string) => {
    removeLanguageMutation.mutate(id);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('storyOptions.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('storyOptions.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {t('storyOptions.categories')}
            </CardTitle>
            <CardDescription>
              {t('storyOptions.categoriesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('storyOptions.addCategoryPlaceholder')}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <Button 
                onClick={addCategory} 
                size="sm"
                disabled={addCategoryMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {categoriesLoading ? (
              <div className="text-center py-4">Loading categories...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category.id}>
                    {editingCategoryId === category.id ? (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="h-6 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={saveEditCategory}
                          disabled={updateCategoryMutation.isPending}
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={cancelEditCategory}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {category.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-blue-500 hover:text-white"
                          onClick={() => startEditCategory(category)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeCategory(category.id)}
                          disabled={removeCategoryMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {t('storyOptions.languages')}
            </CardTitle>
            <CardDescription>
              {t('storyOptions.languagesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Language code (e.g., en, ar, fr)"
                  value={newLanguageCode}
                  onChange={(e) => setNewLanguageCode(e.target.value)}
                />
                <Input
                  placeholder="Language name (e.g., English)"
                  value={newLanguageName}
                  onChange={(e) => setNewLanguageName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                />
                <Button 
                  onClick={addLanguage} 
                  size="sm"
                  disabled={addLanguageMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {languagesLoading ? (
              <div className="text-center py-4">Loading languages...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <div key={language.id}>
                    {editingLanguageId === language.id ? (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
                        <Input
                          value={editingLanguageCode}
                          onChange={(e) => setEditingLanguageCode(e.target.value)}
                          className="h-6 text-sm w-16"
                          placeholder="Code"
                        />
                        <Input
                          value={editingLanguageName}
                          onChange={(e) => setEditingLanguageName(e.target.value)}
                          className="h-6 text-sm"
                          placeholder="Name"
                          onKeyPress={(e) => e.key === 'Enter' && saveEditLanguage()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={saveEditLanguage}
                          disabled={updateLanguageMutation.isPending}
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={cancelEditLanguage}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {language.name} ({language.code})
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-blue-500 hover:text-white"
                          onClick={() => startEditLanguage(language)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeLanguage(language.id)}
                          disabled={removeLanguageMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryOptions;
