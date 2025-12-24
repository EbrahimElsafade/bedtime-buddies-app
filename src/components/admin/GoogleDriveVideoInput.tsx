import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HardDrive, X, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleDriveVideoInputProps {
  lessonIndex: number;
  videoUrl?: string | null;
  onVideoChange: (lessonIndex: number, fileId: string, duration?: number) => void;
  onClearVideo: (lessonIndex: number) => void;
}

// Extract Google Drive file ID from various URL formats
export const extractGoogleDriveId = (url: string): string | null => {
  if (!url) return null;
  
  // If it's already just an ID (alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    return url;
  }

  const patterns = [
    // https://drive.google.com/file/d/FILE_ID/view
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/open?id=FILE_ID
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/uc?id=FILE_ID
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    // https://docs.google.com/file/d/FILE_ID
    /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// Fetch video duration from backend
async function fetchVideoDuration(fileId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-video-duration', {
      body: { fileId }
    });
    
    if (error) {
      console.error('Error fetching video duration:', error);
      return null;
    }
    
    if (data?.duration) {
      return data.duration;
    }
    
    return null;
  } catch (err) {
    console.error('Failed to fetch video duration:', err);
    return null;
  }
}

export const GoogleDriveVideoInput: React.FC<GoogleDriveVideoInputProps> = ({
  lessonIndex,
  videoUrl,
  onVideoChange,
  onClearVideo,
}) => {
  const [inputValue, setInputValue] = useState(videoUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);

    if (!value.trim()) {
      return;
    }

    const fileId = extractGoogleDriveId(value);
    if (fileId) {
      setIsLoading(true);
      
      // Fetch duration from backend
      const duration = await fetchVideoDuration(fileId);
      
      if (duration !== null) {
        onVideoChange(lessonIndex, fileId, duration);
        toast.success(`Video duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
      } else {
        // Still set the video, but without duration
        onVideoChange(lessonIndex, fileId);
        toast.warning('Could not fetch video duration. Please ensure the video is shared with the service account.');
      }
      
      setIsLoading(false);
      setError(null);
    } else if (value.length > 0) {
      setError('Invalid Google Drive URL or file ID');
    }
  };

  const handleClear = () => {
    setInputValue('');
    setError(null);
    onClearVideo(lessonIndex);
  };

  const currentFileId = videoUrl ? extractGoogleDriveId(videoUrl) : null;

  return (
    <div className="space-y-2">
      <Label>Google Drive Video</Label>
      
      <Alert>
        <AlertDescription className="text-xs">
          Paste a Google Drive video link or file ID. Make sure the file is shared with "Anyone with the link" as Viewer.
        </AlertDescription>
      </Alert>

      {currentFileId ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <HardDrive className="h-4 w-4 text-blue-600" />
            <span className="text-sm flex-1 truncate font-mono">
              {currentFileId}
            </span>
            <a
              href={`https://drive.google.com/file/d/${currentFileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Preview iframe */}
          <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-md border bg-muted">
            <iframe
              src={`https://drive.google.com/file/d/${currentFileId}/preview`}
              title="Video preview"
              className="h-full w-full"
              allow="autoplay"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-md">
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  Fetching video duration...
                </p>
              </>
            ) : (
              <>
                <HardDrive className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  No Google Drive video linked
                </p>
              </>
            )}
          </div>
          <Input
            type="text"
            placeholder="Paste Google Drive URL or file ID"
            value={inputValue}
            onChange={handleInputChange}
            className="text-sm"
            disabled={isLoading}
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
