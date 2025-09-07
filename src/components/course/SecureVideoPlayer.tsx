import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Play, AlertTriangle } from 'lucide-react';
import { useSecureVideo } from '@/hooks/useSecureVideo';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SecureVideoPlayerProps {
  lessonId: string;
  fallbackVideoUrl?: string; // For YouTube/external videos
  title: string;
  className?: string;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  lessonId,
  fallbackVideoUrl,
  title,
  className = '',
}) => {
  const { getSecureVideoUrl } = useSecureVideo();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [videoState, setVideoState] = useState({
    videoUrl: null as string | null,
    isLoading: false,
    error: null as string | null,
    requiresSubscription: false,
    hasVideo: true,
  });

  useEffect(() => {
    const loadVideo = async () => {
      const result = await getSecureVideoUrl(lessonId);
      setVideoState(result);
    };

    loadVideo();
  }, [lessonId, getSecureVideoUrl]);

  const handleRetry = () => {
    const loadVideo = async () => {
      const result = await getSecureVideoUrl(lessonId);
      setVideoState(result);
    };
    loadVideo();
  };

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Show loading state
  if (videoState.isLoading) {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading secure video...</p>
        </div>
      </Card>
    );
  }

  // Show subscription required message
  if (videoState.requiresSubscription) {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <Lock className="w-12 h-12 text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Premium Content</h3>
            <p className="text-muted-foreground mt-2">
              This lesson requires a premium subscription to access.
            </p>
          </div>
          <Button onClick={handleSubscribe} className="mt-2">
            Upgrade to Premium
          </Button>
        </div>
      </Card>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <Lock className="w-12 h-12 text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Login Required</h3>
            <p className="text-muted-foreground mt-2">
              Please log in to access this video content.
            </p>
          </div>
          <Button onClick={handleLogin} className="mt-2">
            Log In
          </Button>
        </div>
      </Card>
    );
  }

  // Show error with fallback to external video
  if (videoState.error && !videoState.hasVideo && fallbackVideoUrl) {
    return (
      <Card className={`aspect-video ${className}`}>
        <iframe
          src={fallbackVideoUrl}
          title={title}
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Card>
    );
  }

  // Show error state
  if (videoState.error) {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg">Video Error</h3>
            <p className="text-muted-foreground mt-2">{videoState.error}</p>
          </div>
          <Button onClick={handleRetry} variant="outline" className="mt-2">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Show secure video player
  if (videoState.videoUrl) {
    return (
      <Card className={`aspect-video ${className}`}>
        <video
          src={videoState.videoUrl}
          title={title}
          className="w-full h-full rounded-lg"
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()} // Disable right-click
        >
          Your browser does not support the video tag.
        </video>
      </Card>
    );
  }

  // Fallback to external video if available
  if (fallbackVideoUrl) {
    return (
      <Card className={`aspect-video ${className}`}>
        <iframe
          src={fallbackVideoUrl}
          title={title}
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Card>
    );
  }

  // No video available
  return (
    <Card className={`aspect-video flex items-center justify-center bg-muted ${className}`}>
      <div className="flex flex-col items-center gap-2 text-center p-6">
        <Play className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">No video available for this lesson</p>
      </div>
    </Card>
  );
};