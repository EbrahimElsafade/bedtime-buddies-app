import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Video, X, FolderOpen, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface CourseVideoUploadProps {
  lessonIndex: number;
  lessonOrder: number;
  videoPath?: string | null;
  isUploading: boolean;
  progress: number;
  error?: string | null;
  onVideoChange: (lessonIndex: number, file: File) => Promise<void>;
  onClearVideo: (lessonIndex: number) => void;
}

export const CourseVideoUpload: React.FC<CourseVideoUploadProps> = ({
  lessonIndex,
  lessonOrder,
  videoPath,
  isUploading,
  progress,
  error,
  onVideoChange,
  onClearVideo,
}) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onVideoChange(lessonIndex, file);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemove = () => {
    onClearVideo(lessonIndex);
  };

  return (
    <div className="space-y-2">
      <Label>Lesson Video (HLS)</Label>
      
      <Alert>
        <AlertDescription className="text-xs">
          Upload video file (MP4, MOV, etc.) - max 500MB. Video will be automatically converted to HLS format for streaming.
        </AlertDescription>
      </Alert>

      {isUploading ? (
        <div className="space-y-2 p-4 border rounded-md bg-primary/5">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {progress < 50 ? 'Uploading video...' : 'Processing video...'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      ) : error ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border border-destructive/50 rounded-md bg-destructive/10">
            <span className="text-sm text-destructive flex-1">{error}</span>
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
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="text-sm"
          />
        </div>
      ) : videoPath ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <Video className="h-4 w-4 text-green-600" />
            <span className="text-sm flex-1 truncate">
              {videoPath.includes('/') ? videoPath.split('/').pop() : videoPath}
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
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-md">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              No video uploaded
            </p>
          </div>
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
};
