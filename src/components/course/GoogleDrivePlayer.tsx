import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

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

  if (!fileId) {
    return (
      <div
        className={cn("flex w-full items-center justify-center bg-muted text-muted-foreground", className)}
        style={{ height: "360px" }}
      >
        <p>No video available</p>
      </div>
    );
  }

  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

  const plyrSource = {
    type: "video" as const,
    sources: [{ src: directUrl, type: "video/mp4" }],
    poster: thumbUrl,
  };

  const plyrOptions = {
    controls: ["play", "progress", "current-time", "mute", "volume", "fullscreen"],
    autoplay: false,
    resetOnEnd: true,
  };

  if (isMobile) {
    return (
      <div className={cn("relative w-full bg-black", className)} style={{ height: "260px" }}>
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img
              src={thumbUrl}
              alt={title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.8,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl">
                <Play className="ml-1 h-7 w-7 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          </button>
        ) : (
          <div style={{ width: "100%", height: "100%" }}>
            <Plyr source={plyrSource} options={{ ...plyrOptions, autoplay: true }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden bg-black", className)} style={{ height: "450px" }}>
      <Plyr source={plyrSource} options={plyrOptions} />
    </div>
  );
};

export default GoogleDrivePlayer;
