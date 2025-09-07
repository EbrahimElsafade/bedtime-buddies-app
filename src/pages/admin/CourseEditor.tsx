import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Eye, ArrowLeft } from "lucide-react";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  cover_image: z.string().nullable().optional(),
  is_free: z.boolean().default(true),
  is_published: z.boolean().default(false),
  languages: z.array(z.string()).min(1, "At least one language is required"),
});

type CourseFormData = z.infer<typeof courseSchema>;
type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];

const COURSE_CATEGORIES = [
  "language-learning",
  "science",
  "mathematics",
  "history",
  "arts",
  "technology",
  "health",
  "business",
];

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
];

const CourseEditor = () => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      cover_image: "",
      is_free: true,
      is_published: false,
      languages: ["en"],
    },
  });

  const { watch, setValue } = form;
  const languages = watch("languages");

  useEffect(() => {
    if (isEditing) {
      loadCourse();
    }
  }, [id, isEditing]);

  const loadCourse = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      form.reset({
        title: data.title,
        description: data.description,
        category: data.category,
        cover_image: data.cover_image || "",
        is_free: data.is_free,
        is_published: data.is_published,
        languages: data.languages,
      });
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error(t("forms.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const updateData: Partial<CourseInsert> = {
          title: data.title,
          description: data.description,
          category: data.category,
          cover_image: data.cover_image || null,
          is_free: data.is_free,
          is_published: data.is_published,
          languages: data.languages,
        };

        const { error } = await supabase
          .from("courses")
          .update(updateData)
          .eq("id", id);

        if (error) throw error;
        toast.success(t("forms.saved"));
      } else {
        const insertData: CourseInsert = {
          title: data.title,
          description: data.description,
          category: data.category,
          cover_image: data.cover_image || null,
          is_free: data.is_free,
          is_published: data.is_published,
          languages: data.languages,
        };

        const { error } = await supabase
          .from("courses")
          .insert(insertData);

        if (error) throw error;
        toast.success(t("courses.addNew"));
      }

      navigate("/admin/courses");
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(t("forms.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setValue("languages", [...languages, newLanguage]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (langToRemove: string) => {
    if (languages.length > 1) {
      setValue("languages", languages.filter(lang => lang !== langToRemove));
    }
  };

  const handleSaveAsDraft = () => {
    setValue("is_published", false);
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue("is_published", true);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? t("courses.edit") : t("courses.addNew")}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Edit course details" : "Create a new educational course"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {t("storyEditor.saveAsDraft")}
          </Button>
          <Button onClick={handlePublish} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            {t("storyEditor.publish")}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("storyEditor.basicInfo")}</CardTitle>
                  <CardDescription>
                    Basic information about the course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("storyEditor.storyTitle")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("storyEditor.description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter course description"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("storyEditor.category")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COURSE_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cover_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("storyEditor.coverImage")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter cover image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("storyEditor.languages")}</CardTitle>
                  <CardDescription>
                    Select the languages this course will be available in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                        {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name || lang}
                        {languages.length > 1 && (
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeLanguage(lang)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Add language" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_LANGUAGES.filter(lang => !languages.includes(lang.code)).map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={addLanguage} disabled={!newLanguage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("storyEditor.settings")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_free"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Free Course</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this course available for free
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Published</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this course visible to users
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseEditor;