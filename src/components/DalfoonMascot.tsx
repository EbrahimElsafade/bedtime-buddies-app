import { useState, useEffect } from 'react';
import dalfoonLogo from '@/assets/dalfoon-logo.png';

interface DalfoonMascotProps {
  expression?: 'happy' | 'curious' | 'cheering' | 'motivating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export function DalfoonMascot({ 
  expression = 'happy', 
  size = 'md',
  animate = true,
  className = ''
}: DalfoonMascotProps) {
  const [showBubbles, setShowBubbles] = useState(false);

  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setShowBubbles(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animate]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const expressionClasses = {
    happy: 'animate-float',
    curious: 'animate-pulse',
    cheering: 'animate-bounce',
    motivating: 'animate-wave'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img 
        src={dalfoonLogo}
        alt="Dalfoon the dolphin"
        className={`
          ${sizeClasses[size]} 
          ${animate ? expressionClasses[expression] : ''} 
          drop-shadow-lg transition-all duration-300
        `}
      />
      
      {/* Animated bubbles */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none">
          {showBubbles && (
            <>
              <div className="absolute -top-2 -right-1 w-2 h-2 bg-ocean-light rounded-full animate-bubble opacity-70" />
              <div className="absolute -top-4 left-1 w-1.5 h-1.5 bg-wave-DEFAULT rounded-full animate-bubble animation-delay-150 opacity-60" />
              <div className="absolute -top-3 right-2 w-1 h-1 bg-ocean-DEFAULT rounded-full animate-bubble animation-delay-300 opacity-80" />
            </>
          )}
        </div>
      )}
      
      {/* Splash effect for cheering */}
      {expression === 'cheering' && animate && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gradient-to-r from-transparent via-ocean-light to-transparent rounded-full animate-splash opacity-50" />
      )}
    </div>
  );
}