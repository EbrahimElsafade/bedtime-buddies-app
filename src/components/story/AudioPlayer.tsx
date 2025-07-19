import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  // SkipBack,
  // SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  title: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentSectionDir: "rtl" | "ltr";
}

export const AudioPlayer = ({
  audioUrl,
  onEnded,
  title,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  currentSectionDir,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioSrc, setAudioSrc] = useState<string>("");

  // Generate public URL for audio file
  useEffect(() => {
    const getAudioUrl = () => {
      if (audioUrl.startsWith("http")) {
        // Already a full URL
        return audioUrl;
      } else {
        // Determine the correct folder based on file name pattern
        let folder = "story-audio"; // Default folder

        if (audioUrl.includes("story-voices") || audioUrl.includes("voice-")) {
          folder = "story-voices";
        } else if (
          audioUrl.includes("story-audio") ||
          audioUrl.includes("audio-")
        ) {
          folder = "story-audio";
        }

        // Generate public URL from Supabase storage
        const { data } = supabase.storage
          .from("admin-content")
          .getPublicUrl(`${folder}/${audioUrl}`);
        return data.publicUrl;
      }
    };

    const url = getAudioUrl();
    console.log("Audio URL generated:", url, "from original:", audioUrl);
    setAudioSrc(url);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (hasNext) {
        onNext?.();
      } else {
        setIsPlaying(false);
        onEnded?.();
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio loading error:", e);
      console.error("Audio src:", audioSrc);
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [onEnded, audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current || !audioSrc) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioSrc) {
    return (
      <Card className="p-4 bg-white/90 dark:bg-nightsky-light/90 backdrop-blur-sm border-dream-light/20">
        <div className="text-center text-gray-500">No audio available</div>
      </Card>
    );
  }

  return (
    <div className="py-4">
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        crossOrigin="anonymous"
      />

      <div className="space-y-2">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          dir={currentSectionDir}
          className="w-full"
          disabled={isLoading || duration === 0}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2 space-x-4">
            {/* Play/Pause Button */}
            <Button
              onClick={togglePlay}
              disabled={isLoading}
              className="h-12 w-12 rounded-full"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 w-40">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};
