
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Upload } from "lucide-react";
import { StoryData, languageOptions } from "./types";

interface LegacyScenesManagerProps {
  storyData: StoryData;
  setStoryData: (data: StoryData) => void;
}

export const LegacyScenesManager = ({ storyData, setStoryData }: LegacyScenesManagerProps) => {
  const handleAddScene = () => {
    const newScene = {
      scene_order: storyData.scenes.length + 1,
      image: null,
      translations: storyData.languages.reduce((acc, lang) => {
        acc[lang] = { text: "", audio_url: null };
        return acc;
      }, {} as Record<string, { text: string; audio_url: string | null }>)
    };
    
    setStoryData({
      ...storyData,
      scenes: [...storyData.scenes, newScene]
    });
  };

  const handleDeleteScene = (index: number) => {
    const updatedScenes = [...storyData.scenes];
    updatedScenes.splice(index, 1);
    
    // Reorder scenes
    const reorderedScenes = updatedScenes.map((scene, idx) => ({
      ...scene,
      scene_order: idx + 1
    }));
    
    setStoryData({
      ...storyData,
      scenes: reorderedScenes
    });
  };

  const handleUpdateSceneTranslation = (
    sceneIndex: number,
    language: string,
    text: string
  ) => {
    const updatedScenes = [...storyData.scenes];
    updatedScenes[sceneIndex].translations[language].text = text;
    
    setStoryData({
      ...storyData,
      scenes: updatedScenes
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Scenes (Legacy)</CardTitle>
        <CardDescription>
          Legacy scene management - consider using Sections above for new stories
        </CardDescription>
        <Button 
          type="button" 
          onClick={handleAddScene}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Scene
        </Button>
      </CardHeader>
      <CardContent>
        {storyData.scenes.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              No scenes added yet. Click "Add Scene" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {storyData.scenes.map((scene, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Scene {scene.scene_order}</CardTitle>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteScene(index)}
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
                  
                  <Tabs defaultValue={storyData.languages[0]}>
                    <TabsList>
                      {storyData.languages.map(lang => {
                        const langOption = languageOptions.find(opt => opt.value === lang);
                        return (
                          <TabsTrigger key={lang} value={lang}>
                            {langOption?.label || lang}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    {storyData.languages.map(lang => (
                      <TabsContent key={lang} value={lang}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Text Content</Label>
                            <Textarea
                              placeholder={`Enter scene text in ${lang}`}
                              value={scene.translations[lang]?.text || ""}
                              onChange={(e) => handleUpdateSceneTranslation(
                                index, 
                                lang, 
                                e.target.value
                              )}
                              className="min-h-[120px]"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
