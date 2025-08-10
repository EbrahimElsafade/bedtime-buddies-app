import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMultilingualText } from "@/utils/multilingualUtils";

const Stories = () => {
  const { t } = useTranslation(['stories', 'misc']);
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stories:", error);
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>{t('misc:loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>{t('misc:error')}</p>
        </div>
      </div>
    );
  }

  const filteredStories = stories?.filter(story => {
    const title = getMultilingualText(story.title, language);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-dream-DEFAULT mb-4">
          {t('stories:allStories')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('stories:browseCollection')}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('stories:searchStories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={t('stories:allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('stories:allCategories')}</SelectItem>
            <SelectItem value="sleeping">{t('stories:category.sleeping')}</SelectItem>
            <SelectItem value="religious">{t('stories:category.religious')}</SelectItem>
            <SelectItem value="developmental">{t('stories:category.developmental')}</SelectItem>
            <SelectItem value="entertainment">{t('stories:category.entertainment')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchTerm || selectedCategory !== "all" 
              ? t('stories:noStoriesFound')
              : t('stories:noStoriesAvailable')
            }
          </p>
          <Link to="/">
            <Button className="mt-4">{t('stories:backToStories')}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const title = getMultilingualText(story.title, language);
            const description = getMultilingualText(story.description, language);
            
            return (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={story.cover_image || "/placeholder.svg"}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {!story.is_free && (
                      <Badge variant="secondary" className="bg-moon-DEFAULT text-white">
                        {t('misc:premium.tag')}
                      </Badge>
                    )}
                    {story.is_free && (
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        {t('misc:free.tag')}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{t('stories:duration', { duration: story.duration || 5 })}</span>
                    </div>
                    <Badge variant="outline">
                      {t(`stories:category.${story.category}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {description}
                  </p>
                  <Link to={`/story/${story.id}`}>
                    <Button className="w-full">
                      {t('stories:readNow')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stories;
