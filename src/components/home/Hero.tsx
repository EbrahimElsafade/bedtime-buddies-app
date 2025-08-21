
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
    </section>
  );
};

export default Hero;
