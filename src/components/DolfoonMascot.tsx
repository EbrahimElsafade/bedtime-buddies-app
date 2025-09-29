import { useState, useEffect } from 'react'
import dolfoonLogo from '@/assets/dolfoon-logo.png'

interface DolfoonMascotProps {
  expression?: 'happy' | 'curious' | 'cheering' | 'motivating'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

export function DolfoonMascot({
  expression = 'happy',
  size = 'md',
  animate = true,
  className = '',
}: DolfoonMascotProps) {
  const [showBubbles, setShowBubbles] = useState(false)

  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setShowBubbles(prev => !prev)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [animate])

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }

  const expressionClasses = {
    happy: 'animate-float',
    curious: 'animate-pulse',
    cheering: 'animate-bounce',
    motivating: 'animate-wave',
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={dolfoonLogo}
        alt="Dolfoon the dolphin"
        className={` ${sizeClasses[size]} ${animate ? expressionClasses[expression] : ''} rounded-full drop-shadow-lg transition-all duration-1000`}
      />

      {/* Animated bubbles */}
      {animate && (
        <div className="pointer-events-none absolute inset-0">
          {showBubbles && (
            <>
              <div className="absolute -right-1 -top-2 h-2 w-2 animate-bubble rounded-full bg-primary opacity-70" />
              <div className="bg-wave-DEFAULT animation-delay-150 absolute -top-4 left-1 h-1.5 w-1.5 animate-bubble rounded-full opacity-60" />
              <div className="bg-primary-foreground animation-delay-300 absolute -top-3 right-2 h-1 w-1 animate-bubble rounded-full opacity-80" />
            </>
          )}
        </div>
      )}

      {/* Splash effect for cheering */}
      {expression === 'cheering' && animate && (
        <div className="absolute -bottom-2 left-1/2 h-2 w-8 -translate-x-1/2 transform animate-splash rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      )}
    </div>
  )
}
