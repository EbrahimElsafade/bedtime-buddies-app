
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('hero');
  
  return (
    <section className="py-8 md:py-12 lg:py-20 px-4 relative overflow-hidden fun-cursor">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bubbly mb-3 md:mb-4 text-dream-DEFAULT leading-tight animate-slide-up">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-dream-DEFAULT dark:text-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/stories" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-dream-DEFAULT hover:bg-dream-dark hover:text-white text-black dark:text-white px-6 md:px-8 animate-bounce-gentle hover:animate-wiggle transition-all duration-300">
                {t('exploreButton')} <ArrowRight className="rtl:rotate-180 ms-2 h-4 w-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-dream-light dark:text-dream-DEFAULT px-6 md:px-8 hover:animate-pulse-glow transition-all duration-300">
                  {t('signUpButton')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced decorative elements with more interactivity */}
      <div className="absolute top-1/2 left-4 md:left-10 transform -translate-y-1/2 w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-moon-light/40 to-moon-DEFAULT/20 animate-float animate-pulse-glow"></div>
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-tl from-dream-light/30 to-dream-DEFAULT/15 animate-float animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-6 md:top-10 right-12 md:right-20 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-dream-DEFAULT/20 to-moon-light/15 animate-twinkle animate-wiggle"></div>
      
      {/* Additional magical elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-moon-DEFAULT/30 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-dream-light/25 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-3/4 left-3/4 w-3 h-3 bg-moon-light/40 rounded-full animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>

      {/* Fun SVG Elements */}
      {/* Rainbow */}
      <div className="absolute top-16 left-8 animate-float" style={{ animationDelay: '0.8s' }}>
        <svg width="60" height="30" viewBox="0 0 60 30" fill="none" className="opacity-60">
          <path d="M5 25 C15 5, 45 5, 55 25" stroke="#FF6B9D" strokeWidth="3" fill="none" />
          <path d="M8 22 C16 8, 44 8, 52 22" stroke="#FFD93D" strokeWidth="3" fill="none" />
          <path d="M11 19 C18 11, 42 11, 49 19" stroke="#6BCF7F" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Cloud */}
      <div className="absolute top-20 right-16 animate-float" style={{ animationDelay: '1.2s' }}>
        <svg width="50" height="30" viewBox="0 0 50 30" fill="none" className="opacity-50">
          <ellipse cx="35" cy="20" rx="10" ry="8" fill="white" />
          <ellipse cx="25" cy="18" rx="12" ry="10" fill="white" />
          <ellipse cx="15" cy="20" rx="8" ry="6" fill="white" />
        </svg>
      </div>

      {/* Balloon */}
      <div className="absolute bottom-16 left-16 animate-float" style={{ animationDelay: '2.1s' }}>
        <svg width="25" height="40" viewBox="0 0 25 40" fill="none" className="opacity-70">
          <ellipse cx="12" cy="12" rx="10" ry="14" fill="#FF6B9D" />
          <line x1="12" y1="26" x2="12" y2="38" stroke="#8B5CF6" strokeWidth="2" />
          <polygon points="10,36 14,36 12,40" fill="#8B5CF6" />
        </svg>
      </div>

      {/* Shooting Star */}
      <div className="absolute top-32 right-32 animate-twinkle" style={{ animationDelay: '1.8s' }}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="opacity-80">
          <path d="M35 10 L25 10" stroke="#FFD93D" strokeWidth="2" />
          <path d="M30 6 L25 10 L30 14" stroke="#FFD93D" strokeWidth="2" fill="none" />
          <circle cx="35" cy="10" r="3" fill="#FFD93D" />
        </svg>
      </div>

      {/* Magic Wand */}
      <div className="absolute bottom-32 right-8 animate-wiggle" style={{ animationDelay: '2.5s' }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="opacity-60">
          <line x1="5" y1="25" x2="20" y2="10" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
          <polygon points="20,8 22,10 20,12 18,10" fill="#FFD93D" />
          <circle cx="8" cy="22" r="1" fill="#FF6B9D" />
          <circle cx="12" cy="18" r="1" fill="#6BCF7F" />
          <circle cx="16" cy="14" r="1" fill="#FFD93D" />
        </svg>
      </div>

      {/* Castle */}
      <div className="absolute top-40 left-32 animate-float" style={{ animationDelay: '3.2s' }}>
        <svg width="45" height="35" viewBox="0 0 45 35" fill="none" className="opacity-50">
          <rect x="5" y="15" width="35" height="20" fill="#8B5CF6" />
          <rect x="10" y="10" width="6" height="10" fill="#8B5CF6" />
          <rect x="29" y="10" width="6" height="10" fill="#8B5CF6" />
          <polygon points="8,10 13,5 18,10" fill="#FF6B9D" />
          <polygon points="27,10 32,5 37,10" fill="#FF6B9D" />
          <rect x="18" y="20" width="8" height="15" fill="#6BCF7F" />
          <circle cx="22" cy="27" r="2" fill="#FFD93D" />
        </svg>
      </div>

      {/* Butterfly */}
      <div className="absolute top-48 right-24 animate-bounce-gentle" style={{ animationDelay: '1.4s' }}>
        <svg width="35" height="25" viewBox="0 0 35 25" fill="none" className="opacity-70">
          <ellipse cx="10" cy="8" rx="8" ry="6" fill="#FF6B9D" transform="rotate(-15 10 8)" />
          <ellipse cx="25" cy="8" rx="8" ry="6" fill="#6BCF7F" transform="rotate(15 25 8)" />
          <ellipse cx="8" cy="17" rx="6" ry="4" fill="#FFD93D" transform="rotate(-10 8 17)" />
          <ellipse cx="27" cy="17" rx="6" ry="4" fill="#8B5CF6" transform="rotate(10 27 17)" />
          <line x1="17" y1="5" x2="17" y2="20" stroke="#4A5568" strokeWidth="2" />
          <circle cx="17" cy="5" r="2" fill="#4A5568" />
        </svg>
      </div>

      {/* Sun */}
      <div className="absolute top-8 left-48 animate-twinkle" style={{ animationDelay: '0.3s' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-60">
          <circle cx="20" cy="20" r="8" fill="#FFD93D" />
          <g stroke="#FFD93D" strokeWidth="2" strokeLinecap="round">
            <line x1="20" y1="4" x2="20" y2="8" />
            <line x1="20" y1="32" x2="20" y2="36" />
            <line x1="4" y1="20" x2="8" y2="20" />
            <line x1="32" y1="20" x2="36" y2="20" />
            <line x1="8.5" y1="8.5" x2="11.3" y2="11.3" />
            <line x1="28.7" y1="28.7" x2="31.5" y2="31.5" />
            <line x1="8.5" y1="31.5" x2="11.3" y2="28.7" />
            <line x1="28.7" y1="11.3" x2="31.5" y2="8.5" />
          </g>
        </svg>
      </div>

      {/* Flower */}
      <div className="absolute bottom-40 left-40 animate-float" style={{ animationDelay: '2.8s' }}>
        <svg width="30" height="35" viewBox="0 0 30 35" fill="none" className="opacity-60">
          <circle cx="15" cy="15" r="3" fill="#FFD93D" />
          <ellipse cx="15" cy="8" rx="4" ry="6" fill="#FF6B9D" />
          <ellipse cx="22" cy="15" rx="6" ry="4" fill="#FF6B9D" transform="rotate(90 22 15)" />
          <ellipse cx="15" cy="22" rx="4" ry="6" fill="#FF6B9D" />
          <ellipse cx="8" cy="15" rx="6" ry="4" fill="#FF6B9D" transform="rotate(90 8 15)" />
          <line x1="15" y1="22" x2="15" y2="32" stroke="#6BCF7F" strokeWidth="3" />
          <ellipse cx="12" cy="28" rx="3" ry="2" fill="#6BCF7F" transform="rotate(-30 12 28)" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
