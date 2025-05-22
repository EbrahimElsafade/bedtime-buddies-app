
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Image } from "lucide-react";
import { useState } from "react";

interface StorySceneProps {
  scene: {
    id?: string;
    scene_order: number;
    image: string | null;
    translations: Record<string, { text: string; audio_url: string | null }>;
  };
  languages: string[];
  languageOptions: Array<{ value: string; label: string }>;
  onUpdateSceneTranslation: (language: string, text: string) => void;
  onDeleteScene: () => void;
  onUpdateSceneImage: (file: File | null) => void;
}

const StoryScene = ({
  scene,
  languages,
  languageOptions,
  onUpdateSceneTranslation,
  onDeleteScene,
  onUpdateSceneImage,
}: StorySceneProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(scene.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Pass the file to parent component
      onUpdateSceneImage(file);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    onUpdateSceneImage(null);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Scene {scene.scene_order}</CardTitle>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDeleteScene}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>Scene Image</Label>
          <div className="mt-2">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt={`Scene ${scene.scene_order}`} 
                  className="h-48 w-full object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleImageRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md border-2 border-dashed border-muted-foreground/25 p-4">
                <Image className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload an image for this scene
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="max-w-60"
                />
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue={languages[0]}>
          <TabsList>
            {languages.map(lang => {
              const langOption = languageOptions.find(opt => opt.value === lang);
              return (
                <TabsTrigger key={lang} value={lang}>
                  {langOption?.label || lang}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {languages.map(lang => (
            <TabsContent key={lang} value={lang}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Text Content</Label>
                  <Textarea
                    placeholder={`Enter scene text in ${lang}`}
                    value={scene.translations[lang]?.text || ""}
                    onChange={(e) => onUpdateSceneTranslation(lang, e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StoryScene;
