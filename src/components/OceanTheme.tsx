import { ReactNode } from 'react';

interface OceanThemeProps {
  children: ReactNode;
  variant?: 'default' | 'bubbles' | 'waves';
  className?: string;
}

export function OceanTheme({ children, variant = 'default', className = '' }: OceanThemeProps) {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'bubbles':
        return 'bubbles-bg';
      case 'waves':
        return 'waves-bg';
      default:
        return '';
    }
  };

  return (
    <div className={`
      min-h-screen 
      bg-gradient-to-br from-ocean-surface via-wave-light to-sunshine-glow
      ${getBackgroundClass()}
      ${className}
    `}>
      {children}
      
      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating bubbles */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-ocean-light rounded-full animate-bubble opacity-30" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-wave-DEFAULT rounded-full animate-bubble animation-delay-1000 opacity-40" />
        <div className="absolute top-60 left-1/3 w-2 h-2 bg-ocean-DEFAULT rounded-full animate-bubble animation-delay-2000 opacity-50" />
        
        {/* Wave decorations */}
        <div className="absolute bottom-0 left-0 w-full h-20 waves-bg opacity-20" />
      </div>
    </div>
  );
}