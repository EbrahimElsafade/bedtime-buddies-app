
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import StoryBasicDetails from "./story-editor/StoryBasicDetails";
import StoryLanguages from "./story-editor/StoryLanguages";
import StoryScenes from "./story-editor/StoryScenes";
import { useStoryForm } from "./story-editor/useStoryForm";

const StoryEditor = () => {
  const navigate = useNavigate();
  const {
    isEditing,
    isLoading,
    isSubmitting,
    storyData,
    coverImagePreview,
    categoryOptions,
    languageOptions,
    handleStoryDataChange,
    handleCoverImageChange,
    handleCoverImageRemove,
    handleAddLanguage,
    handleRemoveLanguage,
    handleAddScene,
    handleDeleteScene,
    handleUpdateSceneTranslation,
    handleUpdateSceneImage,
    handleSubmit,
  } = useStoryForm();

  console.log("StoryEditor rendering, isEditing:", isEditing);

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/stories")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Story" : "Create New Story"}</h1>
        </div>
      </header>
      
      {isEditing && isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading story details...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-8">
            <StoryBasicDetails
              storyData={storyData}
              coverImagePreview={coverImagePreview}
              categoryOptions={categoryOptions}
              onStoryDataChange={handleStoryDataChange}
              onCoverImageChange={handleCoverImageChange}
              onCoverImageRemove={handleCoverImageRemove}
            />
            
            <StoryLanguages
              languages={storyData.languages}
              languageOptions={languageOptions}
              onLanguageAdd={handleAddLanguage}
              onLanguageRemove={handleRemoveLanguage}
            />
            
            <StoryScenes
              scenes={storyData.scenes}
              languages={storyData.languages}
              languageOptions={languageOptions}
              onAddScene={handleAddScene}
              onDeleteScene={handleDeleteScene}
              onUpdateSceneTranslation={handleUpdateSceneTranslation}
              onUpdateSceneImage={handleUpdateSceneImage}
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/stories")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || storyData.title === "" || storyData.description === ""}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StoryEditor;
