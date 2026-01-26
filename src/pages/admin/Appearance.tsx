
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { useLoading } from "@/contexts/LoadingContext";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { getMultilingualText } from "@/utils/multilingualUtils";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface HomePageSettings {
  freeStory: string;
  freeStoryEnabled: boolean;
  storiesSection: boolean;
  topRated: boolean;
  courses: boolean;
  specialStory: boolean;
  featuredCourses: string[];
}

interface StoryOption {
  id: string;
  title: Record<string, string>;
  cover_image: string | null;
}

interface CourseOption {
  id: string;
  title_en: string;
  title_ar: string | null;
  title_fr: string | null;
}

const Appearance = () => {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const { setIsLoading, setLoadingMessage } = useLoading();
  
  // Fetch home page settings
  const { data: homeSettings, isLoading: homeLoading } = useQuery({
    queryKey: ["appearance-settings", "home_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appearance_settings")
        .select("setting_value")
        .eq("setting_key", "home_page")
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value as unknown as HomePageSettings;
    }
  });

  // Fetch stories for free story selection
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["stories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, title, cover_image")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as StoryOption[];
    }
  });

  // Fetch courses for featured courses selection
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title_en, title_ar, title_fr")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CourseOption[];
    }
  });

  // Local state for settings
  const [settings, setSettings] = useState<HomePageSettings>({
    freeStory: "",
    freeStoryEnabled: true,
    storiesSection: true,
    topRated: true,
    courses: true,
    specialStory: true,
    featuredCourses: [],
  });

  useEffect(() => {
    if (homeSettings) {
      setSettings(homeSettings);
    }
  }, [homeSettings]);

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: HomePageSettings) => {
      const settingsJson: Json = {
        ...newSettings
      };

      const { error } = await supabase
        .from("appearance_settings")
        .upsert({
          setting_key: "home_page",
          setting_value: settingsJson
        }, {
          onConflict: "setting_key"
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('appearance.settingsUpdated'));
      queryClient.invalidateQueries({ queryKey: ["appearance-settings"] });
    },
    onError: (error: Error) => {
      logger.error("Error updating settings:", error);
      toast.error(t('appearance.settingsUpdateError'));
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const updateSetting = <K extends keyof HomePageSettings>(key: K, value: HomePageSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    setIsLoading(homeLoading);
    if (homeLoading) {
      setLoadingMessage('Loading appearance settings...');
    }
  }, [homeLoading, setIsLoading, setLoadingMessage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('appearance.title')}</h1>
        <p className="text-muted-foreground">
          {t('appearance.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance.homepageSections')}</CardTitle>
          <CardDescription>
            {t('appearance.homepageSectionsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="free-story-enabled">{t('appearance.freeStorySection')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('appearance.freeStorySectionDesc')}
              </p>
            </div>
            <Switch
              id="free-story-enabled"
              checked={settings.freeStoryEnabled}
              onCheckedChange={(checked) => updateSetting('freeStoryEnabled', checked)}
            />
          </div>

          {settings.freeStoryEnabled && (
            <div className="space-y-2 ps-6 border-s-2 border-muted">
              <Label htmlFor="free-story">{t('appearance.selectFreeStory')}</Label>
              <Select
                value={settings.freeStory}
                onValueChange={(value) => updateSetting('freeStory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('appearance.chooseFreeStory')} />
                </SelectTrigger>
                <SelectContent>
                  {storiesLoading ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      {t('appearance.loadingStories')}
                    </div>
                  ) : stories && stories.length > 0 ? (
                    stories.map((story) => {
                      const storyTitle = getMultilingualText(story.title, 'en', 'en');
                      return (
                        <SelectItem key={story.id} value={story.id}>
                          {storyTitle}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      {t('appearance.noPublishedStories')}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stories-section">{t('appearance.storiesSection')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('appearance.storiesSectionDesc')}
              </p>
            </div>
            <Switch
              id="stories-section"
              checked={settings.storiesSection}
              onCheckedChange={(checked) => updateSetting('storiesSection', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="top-rated">{t('appearance.topRatedSection')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('appearance.topRatedSectionDesc')}
              </p>
            </div>
            <Switch
              id="top-rated"
              checked={settings.topRated}
              onCheckedChange={(checked) => updateSetting('topRated', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="courses">{t('appearance.coursesSection')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('appearance.coursesSectionDesc')}
              </p>
            </div>
            <Switch
              id="courses"
              checked={settings.courses}
              onCheckedChange={(checked) => updateSetting('courses', checked)}
            />
          </div>

          {settings.courses && (
            <div className="space-y-2 ps-6 border-s-2 border-muted">
              <Label>{t('appearance.selectFeaturedCourses')}</Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('appearance.selectFeaturedCoursesDesc')}
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {coursesLoading ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    {t('appearance.loadingCourses')}
                  </div>
                ) : courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={settings.featuredCourses?.includes(course.id) || false}
                        onChange={(e) => {
                          const currentCourses = settings.featuredCourses || [];
                          if (e.target.checked) {
                            updateSetting('featuredCourses', [...currentCourses, course.id]);
                          } else {
                            updateSetting('featuredCourses', currentCourses.filter(id => id !== course.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`course-${course.id}`} className="text-sm font-normal cursor-pointer">
                        {course.title_en || course.title_ar || course.title_fr || t('common.untitled')}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    {t('appearance.noPublishedCourses')}
                  </div>
                )}
              </div>
              {settings.featuredCourses && settings.featuredCourses.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('appearance.coursesSelected', { count: settings.featuredCourses.length })}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="special-story">{t('appearance.specialStorySection')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('appearance.specialStorySectionDesc')}
              </p>
            </div>
            <Switch
              id="special-story"
              checked={settings.specialStory}
              onCheckedChange={(checked) => updateSetting('specialStory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t('appearance.saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default Appearance;
