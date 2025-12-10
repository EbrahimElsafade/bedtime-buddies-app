import React from 'react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = 'YouTube video player',
  className,
  autoplay = false,
}) => {
  if (!videoId) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground aspect-video",
        className
      )}>
        <p>No video available</p>
      </div>
    );
  }

  // Build embed URL with privacy-enhanced mode
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`;

  return (
    <div className={cn("relative aspect-video w-full", className)}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default YouTubePlayer;
