import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Video, X, FolderOpen, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HLSVideoUploadProps {
  sectionIndex: number;
  videoPreview?: string | null;
  videoUrl?: string | null;
  isUploading?: boolean;
  onVideoChange: (sectionIndex: number, file: File) => Promise<void>;
  onClearVideo: (sectionIndex: number) => void;
}

export const HLSVideoUpload: React.FC<HLSVideoUploadProps> = ({
  sectionIndex,
  videoPreview,
  videoUrl,
  isUploading = false,
  onVideoChange,
  onClearVideo,
}) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onVideoChange(sectionIndex, file);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemove = () => {
    onClearVideo(sectionIndex);
  };

  return (
    <div className="space-y-2">
      <Label>Section Video (replaces image if provided)</Label>
      
      <Alert>
        <AlertDescription className="text-xs">
          Upload video file - any format (MP4, MOV, etc.). Upload starts immediately.
        </AlertDescription>
      </Alert>

      {isUploading ? (
        <div className="flex items-center gap-2 p-4 border rounded-md bg-primary/5">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Uploading video...</span>
        </div>
      ) : (videoPreview || videoUrl) ? (
        <div className="space-y-2">
          {videoPreview && (
            <div className="relative h-96 aspect-video overflow-hidden rounded-md border">
              <video
                src={videoPreview}
                className="h-full w-full object-cover"
                muted
                playsInline
                controls
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <Video className="h-4 w-4 text-green-600" />
            <span className="text-sm flex-1">Video uploaded</span>
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
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-md">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            No video uploaded
          </p>
        </div>
      )}
      
      <Input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="text-sm"
      />
    </div>
  );
};
