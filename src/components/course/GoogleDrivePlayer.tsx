import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
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
  const [showPauseHint, setShowPauseHint] = useState(false);

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

  const handleOverlayTap = () => {
    // Brief visual feedback when user taps (since we block iframe interaction)
    setShowPauseHint(true);
    setTimeout(() => setShowPauseHint(false), 800);
  };

  if (isMobile) {
    return (
      <div className={cn("relative w-full bg-black aspect-[16/18]", className)} style={{ overflow: "hidden" }}>
        {!playing ? (
          /* ── Thumbnail + play button ── */
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
        ) : (
          <>
            {/* ── The actual iframe ── */}
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: "none" }}
            />

            {/* ── Transparent overlay — blocks all taps reaching the iframe ── */}
            <div
              className="absolute inset-0 z-10 w-full h-full"
              style={{ background: "transparent" }}
              onTouchStart={handleOverlayTap}
              onClick={handleOverlayTap}
            />

            {/* ── Optional tap feedback ── */}
            {showPauseHint && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50">
                  <Pause className="h-6 w-6 fill-white text-white" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden bg-black aspect-video", className)}>
      <iframe
        src={`${embedUrl}?autoplay=1`}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default GoogleDrivePlayer;
