import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GoogleDrivePlayerProps {
  fileId: string;
  title?: string;
  className?: string;
  onVideoEnd?: () => void;
  showCountdownOnEnd?: boolean;
}

const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({ fileId, title = "Video player", className }) => {
  const isMobile = useIsMobile();
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!fileId) {
    return (
      <div
        className={cn(
          "flex aspect-[16/18] w-full items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
      >
        <p>No video available</p>
      </div>
    );
  }

  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

  if (isMobile) {
    const scale = 3;
    const scaledWidth = containerSize.width * scale;
    const scaledHeight = containerSize.height * scale;

    return (
      <div ref={containerRef} className={cn("relative w-full overflow-hidden bg-black aspect-[16/18]", className)}>
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 w-full h-full"
          >
            <img
              src={thumbUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform group-active:scale-95">
                <Play className="ml-1 h-7 w-7 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          </button>
        ) : containerSize.width > 0 ? (
          <iframe
            src={embedUrl + "?autoplay=1"}
            title={title}
            className="absolute top-0 left-0 border-0 origin-top-left"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            style={{
              width: scaledWidth,
              height: scaledHeight,
              transform: `scale(${1 / scale})`,
              transformOrigin: "top left",
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden bg-black aspect-video", className)}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default GoogleDrivePlayer;
