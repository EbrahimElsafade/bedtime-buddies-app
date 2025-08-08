
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, X, Upload } from 'lucide-react';

interface StoryAudioUploadProps {
  language: string;
  languageName: string;
  storyAudioFiles: Record<string, File>;
  storyAudioPreviews: Record<string, string>;
  existingStoryAudio: Record<string, string>;
  onStoryAudioChange: (language: string, file: File) => void;
  onRemoveStoryAudio: (language: string) => void;
}

export const StoryAudioUpload: React.FC<StoryAudioUploadProps> = ({
  language,
  languageName,
  storyAudioFiles,
  storyAudioPreviews,
  existingStoryAudio,
  onStoryAudioChange,
  onRemoveStoryAudio,
}) => {
  const hasAudioFile = storyAudioFiles[language];
  const hasAudioPreview = storyAudioPreviews[language];
  const hasExistingAudio = existingStoryAudio[language];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onStoryAudioChange(language, file);
    }
  };

  const handleRemove = () => {
    onRemoveStoryAudio(language);
  };

  return (
    <div className="space-y-2">
      <Label>Story Audio ({languageName})</Label>
      
      {(hasAudioFile || hasAudioPreview || hasExistingAudio) ? (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <Volume2 className="h-4 w-4 text-green-600" />
          <span className="text-sm flex-1">
            {hasAudioFile 
              ? `New file: ${hasAudioFile.name}` 
              : `Audio uploaded for ${languageName}`
            }
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-md">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            No audio uploaded for {languageName}
          </p>
        </div>
      )}
      
      <Input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="text-sm"
      />
    </div>
  );
};
