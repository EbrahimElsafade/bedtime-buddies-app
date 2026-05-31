import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

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
    return (
      <>
        {/* Thumbnail with play button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play ${title}`}
          className={cn("group relative block w-full overflow-hidden bg-black aspect-[16/18]", className)}
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

        {/* Fullscreen modal — only mounts iframe when open */}
        {open && (
          <div
            className="fixed inset-0 z-[999] bg-black flex flex-col"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Close button */}
            <div className="relative flex items-center justify-end px-4 py-3 bg-black shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close video"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* iframe fills remaining height */}
            <div className="flex-1 w-full relative">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={title}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop — plain inline embed
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
