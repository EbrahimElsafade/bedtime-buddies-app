
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
import { Trash2, Upload } from "lucide-react";

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
}

const StoryScene = ({
  scene,
  languages,
  languageOptions,
  onUpdateSceneTranslation,
  onDeleteScene,
}: StorySceneProps) => {
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
          <Label>Scene Image (coming soon)</Label>
          <div className="flex items-center justify-center h-32 bg-muted rounded-md">
            <Upload className="h-8 w-8 text-muted-foreground" />
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
