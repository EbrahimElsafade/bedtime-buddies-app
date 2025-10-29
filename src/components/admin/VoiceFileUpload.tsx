import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, X, Upload, Loader2 } from 'lucide-react';

interface VoiceFileUploadProps {
  language: string;
  languageName: string;
  sectionIndex: number;
  voiceUrls: Record<string, string> | undefined;
  isUploading?: boolean;
  onVoiceFileChange: (sectionIndex: number, language: string, file: File) => Promise<void>;
  onRemoveVoiceFile: (sectionIndex: number, language: string) => void;
}

export const VoiceFileUpload: React.FC<VoiceFileUploadProps> = ({
  language,
  languageName,
  sectionIndex,
  voiceUrls,
  isUploading = false,
  onVoiceFileChange,
  onRemoveVoiceFile,
}) => {
  const hasVoiceUrl = voiceUrls?.[language];
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onVoiceFileChange(sectionIndex, language, file);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemove = () => {
    onRemoveVoiceFile(sectionIndex, language);
  };

  return (
    <div className="space-y-2">
      <Label>Voice Audio ({languageName})</Label>
      
      {isUploading ? (
        <div className="flex items-center gap-2 p-4 border rounded-md bg-primary/5">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Uploading {languageName} audio...</span>
        </div>
      ) : hasVoiceUrl ? (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <Volume2 className="h-4 w-4 text-green-600" />
          <span className="text-sm flex-1">Audio uploaded for {languageName}</span>
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
        disabled={isUploading}
        className="text-sm"
      />
    </div>
  );
};
