import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Video, X, Upload, FolderOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HLSVideoUploadProps {
  sectionIndex: number;
  videoPreview?: string | null;
  onVideoChange: (sectionIndex: number, files: FileList) => void;
  onClearVideo: (sectionIndex: number) => void;
}

export const HLSVideoUpload: React.FC<HLSVideoUploadProps> = ({
  sectionIndex,
  videoPreview,
  onVideoChange,
  onClearVideo,
}) => {
  const [fileCount, setFileCount] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = e.target.files;
      setFileCount(files.length);
      onVideoChange(sectionIndex, files);
    }
  };

  const handleRemove = () => {
    setFileCount(0);
    onClearVideo(sectionIndex);
  };

  return (
    <div className="space-y-2">
      <Label>Section Video (HLS - replaces image if provided)</Label>
      
      <Alert>
        <AlertDescription className="text-xs">
          Upload HLS video files: select the .m3u8 manifest file AND all .ts segment files together.
        </AlertDescription>
      </Alert>

      {(videoPreview || fileCount > 0) ? (
        <div className="space-y-2">
          {videoPreview && (
            <div className="relative h-32 w-full overflow-hidden rounded-md border">
              <video
                src={videoPreview}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <Video className="h-4 w-4 text-green-600" />
            <span className="text-sm flex-1">
              {fileCount > 0 
                ? `${fileCount} HLS file(s) selected` 
                : 'Video uploaded'
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
        accept=".m3u8,.ts,video/*"
        multiple
        onChange={handleFileChange}
        className="text-sm"
      />
    </div>
  );
};
