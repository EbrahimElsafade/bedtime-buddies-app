
import { useEffect, useState } from "react";

interface TextHighlightProps {
  text: string;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  onReset?: () => void;
}

export const TextHighlight = ({ 
  text, 
  isPlaying, 
  currentTime = 0,
  duration = 0,
  onReset 
}: TextHighlightProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Split text into words, preserving spaces and punctuation
  const words = text.split(/(\s+)/);
  
  // Filter out space-only words for progress calculation
  const contentWords = words.filter(word => !/^\s+$/.test(word));
  
  useEffect(() => {
    if (!isPlaying || duration === 0) {
      return;
    }

    // Calculate progress as percentage of audio completion
    const progress = currentTime / duration;
    
    // Calculate which word should be highlighted based on audio progress
    const totalContentWords = contentWords.length;
    let targetWordIndex = Math.floor(progress * totalContentWords);
    
    // Ensure we don't exceed array bounds
    targetWordIndex = Math.min(targetWordIndex, totalContentWords - 1);
    
    // Find the actual index in the full words array (including spaces)
    let actualIndex = 0;
    let contentWordCount = 0;
    
    for (let i = 0; i < words.length; i++) {
      if (!/^\s+$/.test(words[i])) {
        if (contentWordCount === targetWordIndex) {
          actualIndex = i;
          break;
        }
        contentWordCount++;
      }
    }
    
    setCurrentWordIndex(actualIndex);
    
    // Check if audio has ended
    if (progress >= 0.98) { // Near end of audio
      onReset?.();
    }
  }, [currentTime, duration, isPlaying, words, contentWords.length, onReset]);

  // Reset when text changes or audio stops
  useEffect(() => {
    setCurrentWordIndex(0);
  }, [text]);

  useEffect(() => {
    if (!isPlaying) {
      // Optional: Reset highlighting when audio stops
      // setCurrentWordIndex(0);
    }
  }, [isPlaying]);

  return (
    <p className="text-lg md:text-3xl leading-relaxed pb-4">
      {words.map((word, index) => (
        <span
          key={index}
          className={`${
            index === currentWordIndex && isPlaying && !/^\s+$/.test(word)
              ? "bg-yellow-200  rounded px-1 transition-colors duration-300"
              : ""
          }`}
        >
          {word}
        </span>
      ))}
    </p>
  );
};
