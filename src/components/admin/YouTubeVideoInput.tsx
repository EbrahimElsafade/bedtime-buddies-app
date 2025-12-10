import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Youtube, X, ExternalLink, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface YouTubeVideoInputProps {
  lessonIndex: number;
  videoUrl?: string | null;
  onVideoChange: (lessonIndex: number, videoId: string) => void;
  onClearVideo: (lessonIndex: number) => void;
}

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  // If it's already just an ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export const YouTubeVideoInput: React.FC<YouTubeVideoInputProps> = ({
  lessonIndex,
  videoUrl,
  onVideoChange,
  onClearVideo,
}) => {
  const [inputValue, setInputValue] = useState(videoUrl || '');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);

    if (!value.trim()) {
      return;
    }

    const videoId = extractYouTubeId(value);
    if (videoId) {
      onVideoChange(lessonIndex, videoId);
      setError(null);
    } else if (value.length > 0) {
      setError('Invalid YouTube URL or video ID');
    }
  };

  const handleClear = () => {
    setInputValue('');
    setError(null);
    onClearVideo(lessonIndex);
  };

  const currentVideoId = videoUrl ? extractYouTubeId(videoUrl) : null;

  return (
    <div className="space-y-2">
      <Label>YouTube Video (Unlisted)</Label>
      
      <Alert>
        <AlertDescription className="text-xs">
          Paste a YouTube video URL or video ID. Upload your video to YouTube as "Unlisted" for privacy.
        </AlertDescription>
      </Alert>

      {currentVideoId ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <Youtube className="h-4 w-4 text-red-600" />
            <span className="text-sm flex-1 truncate font-mono">
              {currentVideoId}
            </span>
            <a
              href={`https://www.youtube.com/watch?v=${currentVideoId}`}
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
          
          {/* Preview thumbnail */}
          <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-md border">
            <img
              src={`https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`}
              alt="Video thumbnail"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Youtube className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-md">
            <Youtube className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              No YouTube video linked
            </p>
          </div>
          <Input
            type="text"
            placeholder="Paste YouTube URL or video ID (e.g., dQw4w9WgXcQ)"
            value={inputValue}
            onChange={handleInputChange}
            className="text-sm"
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
