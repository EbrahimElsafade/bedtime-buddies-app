import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, X, Pause } from "lucide-react";
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
  const [paused, setPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

  const handleOverlayTap = () => {
    // Toggle pause/play via postMessage to the iframe
    if (iframeRef.current?.contentWindow) {
      if (paused) {
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
      } else {
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
      }
    }
    setPaused((p) => !p);

    // Show icon hint briefly
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setShowHint(true);
    hintTimer.current = setTimeout(() => setShowHint(false), 700);
  };

  if (isMobile) {
    return (
      <>
        {/* Thumbnail with play button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play ${title}`}
          className={cn("group relative block w-full overflow-hidden bg-black", className)}
          style={{ height: "260px" }}
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform group-active:scale-95">
              <Play className="ml-1 h-7 w-7 fill-primary-foreground text-primary-foreground" />
            </div>
          </div>
        </button>

        {/* Fullscreen modal */}
        {open && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              backgroundColor: "#000",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "12px 16px",
                backgroundColor: "#000",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPaused(false);
                }}
                aria-label="Close video"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* iframe + overlay wrapper */}
            <div style={{ flex: 1, position: "relative", width: "100%" }}>
              {/* The actual video iframe */}
              <iframe
                ref={iframeRef}
                src={`${embedUrl}?autoplay=1`}
                title={title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />

              {/* Transparent overlay — blocks controls from showing on tap */}
              <div
                onClick={handleOverlayTap}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 10,
                  background: "transparent",
                  cursor: "pointer",
                }}
              />

              {/* Tap hint icon */}
              {showHint && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {paused ? (
                      <Play className="ml-1 h-6 w-6 fill-white text-white" />
                    ) : (
                      <Pause className="h-6 w-6 fill-white text-white" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop — plain inline embed
  return (
    <div className={cn("relative w-full overflow-hidden bg-black", className)} style={{ height: "450px" }}>
      <iframe
        src={embedUrl}
        title={title}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default GoogleDrivePlayer;
