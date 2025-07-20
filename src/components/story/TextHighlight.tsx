
import { useEffect, useState } from "react";

interface TextHighlightProps {
  text: string;
  isPlaying: boolean;
  onReset?: () => void;
}

export const TextHighlight = ({ text, isPlaying, onReset }: TextHighlightProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Split text into words, preserving spaces and punctuation
  const words = text.split(/(\s+)/);
  
  useEffect(() => {
    if (!isPlaying) {
      setCurrentWordIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          onReset?.();
          return 0;
        }
        return prev + 1;
      });
    }, 250); // Move highlight every 0.25 seconds

    return () => clearInterval(interval);
  }, [isPlaying, words.length, onReset]);

  // Reset when text changes
  useEffect(() => {
    setCurrentWordIndex(0);
  }, [text]);

  return (
    <p className="text-lg md:text-3xl leading-relaxed pb-4">
      {words.map((word, index) => (
        <span
          key={index}
          className={`${
            index === currentWordIndex && isPlaying
              ? "bg-yellow-200 dark:bg-yellow-800 rounded px-1 transition-colors duration-200"
              : ""
          }`}
        >
          {word}
        </span>
      ))}
    </p>
  );
};
