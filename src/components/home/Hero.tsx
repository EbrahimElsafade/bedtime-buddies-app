
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
      {/* Rainbow - moved closer */}
      <div className="absolute top-12 left-6 animate-float" style={{ animationDelay: '0.8s' }}>
        <svg width="60" height="30" viewBox="0 0 60 30" fill="none" className="opacity-60">
          <path d="M5 25 C15 5, 45 5, 55 25" stroke="#FF6B9D" strokeWidth="3" fill="none" />
          <path d="M8 22 C16 8, 44 8, 52 22" stroke="#FFD93D" strokeWidth="3" fill="none" />
          <path d="M11 19 C18 11, 42 11, 49 19" stroke="#6BCF7F" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Cloud - moved closer */}
      <div className="absolute top-16 right-8 animate-float" style={{ animationDelay: '1.2s' }}>
        <svg width="50" height="30" viewBox="0 0 50 30" fill="none" className="opacity-50">
          <ellipse cx="35" cy="20" rx="10" ry="8" fill="white" />
          <ellipse cx="25" cy="18" rx="12" ry="10" fill="white" />
          <ellipse cx="15" cy="20" rx="8" ry="6" fill="white" />
        </svg>
      </div>

      {/* Balloon - moved closer to center */}
      <div className="absolute bottom-20 left-12 animate-float" style={{ animationDelay: '2.1s' }}>
        <svg width="25" height="40" viewBox="0 0 25 40" fill="none" className="opacity-70">
          <ellipse cx="12" cy="12" rx="10" ry="14" fill="#FF6B9D" />
          <line x1="12" y1="26" x2="12" y2="38" stroke="#8B5CF6" strokeWidth="2" />
          <polygon points="10,36 14,36 12,40" fill="#8B5CF6" />
        </svg>
      </div>

      {/* Shooting Star - moved closer */}
      <div className="absolute top-20 right-20 animate-twinkle" style={{ animationDelay: '1.8s' }}>
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="opacity-80">
          <path d="M35 10 L25 10" stroke="#FFD93D" strokeWidth="2" />
          <path d="M30 6 L25 10 L30 14" stroke="#FFD93D" strokeWidth="2" fill="none" />
          <circle cx="35" cy="10" r="3" fill="#FFD93D" />
        </svg>
      </div>

      {/* Magic Wand - moved closer */}
      <div className="absolute bottom-24 right-12 animate-wiggle" style={{ animationDelay: '2.5s' }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="opacity-60">
          <line x1="5" y1="25" x2="20" y2="10" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
          <polygon points="20,8 22,10 20,12 18,10" fill="#FFD93D" />
          <circle cx="8" cy="22" r="1" fill="#FF6B9D" />
          <circle cx="12" cy="18" r="1" fill="#6BCF7F" />
          <circle cx="16" cy="14" r="1" fill="#FFD93D" />
        </svg>
      </div>

      {/* Castle - moved closer */}
      <div className="absolute top-32 left-20 animate-float" style={{ animationDelay: '3.2s' }}>
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

      {/* Butterfly - moved closer */}
      <div className="absolute top-36 right-16 animate-bounce-gentle" style={{ animationDelay: '1.4s' }}>
        <svg width="35" height="25" viewBox="0 0 35 25" fill="none" className="opacity-70">
          <ellipse cx="10" cy="8" rx="8" ry="6" fill="#FF6B9D" transform="rotate(-15 10 8)" />
          <ellipse cx="25" cy="8" rx="8" ry="6" fill="#6BCF7F" transform="rotate(15 25 8)" />
          <ellipse cx="8" cy="17" rx="6" ry="4" fill="#FFD93D" transform="rotate(-10 8 17)" />
          <ellipse cx="27" cy="17" rx="6" ry="4" fill="#8B5CF6" transform="rotate(10 27 17)" />
          <line x1="17" y1="5" x2="17" y2="20" stroke="#4A5568" strokeWidth="2" />
          <circle cx="17" cy="5" r="2" fill="#4A5568" />
        </svg>
      </div>

      {/* Sun - moved closer */}
      <div className="absolute top-6 left-32 animate-twinkle" style={{ animationDelay: '0.3s' }}>
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

      {/* Flower - moved closer */}
      <div className="absolute bottom-32 left-28 animate-float" style={{ animationDelay: '2.8s' }}>
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

      {/* Rocket Ship - moved closer */}
      <div className="absolute top-10 right-24 animate-float" style={{ animationDelay: '1.6s' }}>
        <svg width="35" height="50" viewBox="0 0 35 50" fill="none" className="opacity-75">
          <ellipse cx="17.5" cy="15" rx="8" ry="12" fill="#FF6B9D" />
          <polygon points="17.5,3 12,15 23,15" fill="#FFD93D" />
          <circle cx="17.5" cy="18" r="3" fill="white" />
          <polygon points="8,25 12,35 6,35" fill="#FF4444" />
          <polygon points="27,25 23,35 29,35" fill="#FF4444" />
          <ellipse cx="17.5" cy="40" rx="6" ry="8" fill="#FFA500" />
          <ellipse cx="17.5" cy="45" rx="4" ry="5" fill="#FF6B9D" />
        </svg>
      </div>

      {/* Ice Cream - moved closer */}
      <div className="absolute bottom-16 right-28 animate-bounce-gentle" style={{ animationDelay: '3.1s' }}>
        <svg width="25" height="45" viewBox="0 0 25 45" fill="none" className="opacity-70">
          <polygon points="12.5,20 8,40 17,40" fill="#D2691E" />
          <circle cx="12.5" cy="15" r="8" fill="#FFB6C1" />
          <circle cx="12.5" cy="10" r="6" fill="#87CEEB" />
          <circle cx="12.5" cy="6" r="4" fill="#98FB98" />
          <circle cx="9" cy="12" r="1" fill="#FF1493" />
          <circle cx="16" cy="8" r="1" fill="#FF1493" />
          <circle cx="12.5" cy="18" r="1" fill="#FF1493" />
        </svg>
      </div>

      {/* Teddy Bear - moved closer */}
      <div className="absolute top-44 left-8 animate-wiggle" style={{ animationDelay: '2.2s' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-65">
          <circle cx="20" cy="25" r="12" fill="#DEB887" />
          <circle cx="13" cy="18" r="6" fill="#DEB887" />
          <circle cx="27" cy="18" r="6" fill="#DEB887" />
          <circle cx="20" cy="20" r="8" fill="#F4A460" />
          <circle cx="17" cy="18" r="1.5" fill="black" />
          <circle cx="23" cy="18" r="1.5" fill="black" />
          <ellipse cx="20" cy="22" rx="2" ry="1" fill="black" />
          <path d="M18 24 Q20 26 22 24" stroke="black" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Musical Notes - moved closer */}
      <div className="absolute top-24 left-16 animate-twinkle" style={{ animationDelay: '1.1s' }}>
        <svg width="30" height="25" viewBox="0 0 30 25" fill="none" className="opacity-60">
          <ellipse cx="6" cy="18" rx="3" ry="2" fill="#8B5CF6" />
          <line x1="9" y1="18" x2="9" y2="8" stroke="#8B5CF6" strokeWidth="2" />
          <ellipse cx="22" cy="15" rx="3" ry="2" fill="#FF6B9D" />
          <line x1="25" y1="15" x2="25" y2="5" stroke="#FF6B9D" strokeWidth="2" />
          <path d="M9 8 Q15 6 25 5" stroke="#8B5CF6" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Lollipop - moved closer */}
      <div className="absolute bottom-36 right-20 animate-float" style={{ animationDelay: '3.8s' }}>
        <svg width="20" height="40" viewBox="0 0 20 40" fill="none" className="opacity-70">
          <circle cx="10" cy="10" r="8" fill="#FF69B4" />
          <circle cx="10" cy="10" r="6" fill="#FFB6C1" />
          <circle cx="10" cy="10" r="4" fill="#FF1493" />
          <line x1="10" y1="18" x2="10" y2="35" stroke="#8B4513" strokeWidth="3" />
          <circle cx="10" cy="35" r="2" fill="#8B4513" />
        </svg>
      </div>

      {/* Dinosaur - moved closer */}
      <div className="absolute top-40 right-6 animate-bounce-gentle" style={{ animationDelay: '2.7s' }}>
        <svg width="45" height="35" viewBox="0 0 45 35" fill="none" className="opacity-60">
          <ellipse cx="25" cy="20" rx="15" ry="8" fill="#90EE90" />
          <ellipse cx="35" cy="15" rx="8" ry="6" fill="#90EE90" />
          <circle cx="38" cy="12" r="2" fill="black" />
          <polygon points="42,15 45,12 45,18" fill="#90EE90" />
          <rect x="15" y="25" width="3" height="8" fill="#90EE90" />
          <rect x="22" y="25" width="3" height="8" fill="#90EE90" />
          <rect x="29" y="25" width="3" height="8" fill="#90EE90" />
          <polygon points="10,18 15,15 15,22" fill="#90EE90" />
          <circle cx="5" cy="8" r="3" fill="#90EE90" />
          <circle cx="10" cy="5" r="2" fill="#90EE90" />
          <circle cx="15" cy="8" r="2" fill="#90EE90" />
        </svg>
      </div>

      {/* Cupcake - moved closer */}
      <div className="absolute bottom-8 left-20 animate-twinkle" style={{ animationDelay: '3.5s' }}>
        <svg width="25" height="30" viewBox="0 0 25 30" fill="none" className="opacity-75">
          <path d="M5 15 L20 15 L18 28 L7 28 Z" fill="#DEB887" />
          <ellipse cx="12.5" cy="12" rx="8" ry="5" fill="#FFB6C1" />
          <circle cx="12.5" cy="8" r="2" fill="#FF1493" />
          <line x1="12.5" y1="6" x2="12.5" y2="2" stroke="#FFD93D" strokeWidth="2" />
          <circle cx="12.5" cy="2" r="1" fill="#FF4500" />
        </svg>
      </div>

      {/* Kite - moved closer */}
      <div className="absolute top-16 left-40 animate-float" style={{ animationDelay: '0.9s' }}>
        <svg width="30" height="35" viewBox="0 0 30 35" fill="none" className="opacity-65">
          <polygon points="15,2 25,12 15,22 5,12" fill="#FF6B9D" />
          <polygon points="15,2 25,12 15,12" fill="#FFD93D" />
          <polygon points="15,12 5,12 15,22" fill="#87CEEB" />
          <line x1="15" y1="22" x2="15" y2="30" stroke="#8B4513" strokeWidth="2" />
          <polygon points="12,26 15,24 15,28" fill="#FF6B9D" />
          <polygon points="12,32 15,30 15,34" fill="#87CEEB" />
        </svg>
      </div>

      {/* Pizza Slice - moved closer */}
      <div className="absolute top-28 right-32 animate-wiggle" style={{ animationDelay: '2.9s' }}>
        <svg width="30" height="25" viewBox="0 0 30 25" fill="none" className="opacity-60">
          <path d="M15 2 L28 20 L2 20 Z" fill="#FFD700" />
          <path d="M15 2 L28 20 L2 20 Z" fill="#FF6347" />
          <circle cx="12" cy="14" r="2" fill="#8B0000" />
          <circle cx="20" cy="16" r="1.5" fill="#228B22" />
          <circle cx="8" cy="17" r="1" fill="#FFFF00" />
          <ellipse cx="18" cy="12" rx="2" ry="1" fill="white" />
        </svg>
      </div>

      {/* Fairy - moved closer */}
      <div className="absolute bottom-12 left-36 animate-float" style={{ animationDelay: '1.3s' }}>
        <svg width="25" height="35" viewBox="0 0 25 35" fill="none" className="opacity-70">
          <circle cx="12.5" cy="12" r="6" fill="#FFB6C1" />
          <ellipse cx="8" cy="8" rx="4" ry="6" fill="#E6E6FA" opacity="0.7" />
          <ellipse cx="17" cy="8" rx="4" ry="6" fill="#E6E6FA" opacity="0.7" />
          <ellipse cx="12.5" cy="20" rx="3" ry="8" fill="#FF69B4" />
          <circle cx="10" cy="10" r="1" fill="black" />
          <circle cx="15" cy="10" r="1" fill="black" />
          <path d="M10 14 Q12.5 16 15 14" stroke="#FF1493" strokeWidth="1" fill="none" />
          <line x1="12.5" y1="5" x2="12.5" y2="2" stroke="#FFD700" strokeWidth="2" />
          <polygon points="12.5,2 10,4 15,4" fill="#FFD700" />
        </svg>
      </div>

      {/* Train - moved closer */}
      <div className="absolute top-20 right-36 animate-bounce-gentle" style={{ animationDelay: '3.4s' }}>
        <svg width="50" height="25" viewBox="0 0 50 25" fill="none" className="opacity-65">
          <rect x="5" y="10" width="35" height="12" fill="#FF6B9D" rx="2" />
          <rect x="8" y="8" width="8" height="6" fill="#87CEEB" />
          <rect x="25" y="8" width="12" height="6" fill="#87CEEB" />
          <circle cx="12" cy="20" r="3" fill="#2F4F4F" />
          <circle cx="32" cy="20" r="3" fill="#2F4F4F" />
          <rect x="40" y="12" width="8" height="8" fill="#FFD93D" />
          <polygon points="2,15 5,12 5,18" fill="#FF4500" />
        </svg>
      </div>

      {/* Robot - moved closer */}
      <div className="absolute bottom-28 right-24 animate-twinkle" style={{ animationDelay: '1.9s' }}>
        <svg width="30" height="35" viewBox="0 0 30 35" fill="none" className="opacity-60">
          <rect x="8" y="15" width="14" height="16" fill="#C0C0C0" rx="2" />
          <rect x="10" y="8" width="10" height="8" fill="#C0C0C0" rx="2" />
          <circle cx="12" cy="12" r="2" fill="#00FF00" />
          <circle cx="18" cy="12" r="2" fill="#00FF00" />
          <rect x="13" y="14" width="4" height="2" fill="#FF0000" />
          <rect x="5" y="18" width="4" height="2" fill="#C0C0C0" />
          <rect x="21" y="18" width="4" height="2" fill="#C0C0C0" />
          <rect x="11" y="30" width="3" height="4" fill="#C0C0C0" />
          <rect x="16" y="30" width="3" height="4" fill="#C0C0C0" />
          <circle cx="15" cy="5" r="2" fill="#FFD700" />
        </svg>
      </div>

      {/* More sparkle effects */}
      <div className="absolute top-12 left-36 w-1 h-1 bg-dream-DEFAULT rounded-full animate-twinkle" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-56 right-44 w-2 h-2 bg-moon-light rounded-full animate-twinkle" style={{ animationDelay: '2.3s' }}></div>
      <div className="absolute bottom-28 left-44 w-1.5 h-1.5 bg-dream-light rounded-full animate-twinkle" style={{ animationDelay: '1.7s' }}></div>
      <div className="absolute bottom-52 right-52 w-1 h-1 bg-moon-DEFAULT rounded-full animate-twinkle" style={{ animationDelay: '3.1s' }}></div>
    </section>
  );
};

export default Hero;
