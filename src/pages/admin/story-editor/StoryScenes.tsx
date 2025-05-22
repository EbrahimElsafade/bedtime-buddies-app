
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StoryScene from "./StoryScene";

interface StoryScenesProps {
  scenes: Array<{
    id?: string;
    scene_order: number;
    image: string | null;
    translations: Record<string, { text: string; audio_url: string | null }>;
  }>;
  languages: string[];
  languageOptions: Array<{ value: string; label: string }>;
  onAddScene: () => void;
  onDeleteScene: (index: number) => void;
  onUpdateSceneTranslation: (sceneIndex: number, language: string, text: string) => void;
  onUpdateSceneImage: (sceneIndex: number, file: File | null) => void;
}

const StoryScenes = ({
  scenes,
  languages,
  languageOptions,
  onAddScene,
  onDeleteScene,
  onUpdateSceneTranslation,
  onUpdateSceneImage,
}: StoryScenesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Scenes</CardTitle>
        <CardDescription>
          Add and manage story scenes with text and images
        </CardDescription>
        <Button 
          type="button" 
          onClick={onAddScene}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Scene
        </Button>
      </CardHeader>
      <CardContent>
        {scenes.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              No scenes added yet. Click "Add Scene" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {scenes.map((scene, index) => (
              <StoryScene
                key={index}
                scene={scene}
                languages={languages}
                languageOptions={languageOptions}
                onUpdateSceneTranslation={(language, text) => 
                  onUpdateSceneTranslation(index, language, text)
                }
                onDeleteScene={() => onDeleteScene(index)}
                onUpdateSceneImage={(file) => onUpdateSceneImage(index, file)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryScenes;
