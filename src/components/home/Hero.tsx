
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('hero');
  
  return (
    <section className="py-8 md:py-12 lg:py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bubbly mb-3 md:mb-4 text-dream-DEFAULT leading-tight">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-dream-DEFAULT dark:text-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link to="/stories" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-dream-DEFAULT hover:bg-dream-dark hover:text-white text-black dark:text-white px-6 md:px-8">
                {t('exploreButton')} <ArrowRight className="rtl:rotate-180 ms-2 h-4 w-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-dream-light dark:text-dream-DEFAULT px-6 md:px-8">
                  {t('signUpButton')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative elements - adjusted for mobile */}
      <div className="absolute top-1/2 left-4 md:left-10 transform -translate-y-1/2 w-12 h-12 md:w-20 md:h-20 rounded-full bg-moon-light opacity-30 animate-float"></div>
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-dream-light opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-6 md:top-10 right-12 md:right-20 w-6 h-6 md:w-8 md:h-8 rounded-full bg-dream-DEFAULT opacity-10 animate-twinkle"></div>
    </section>
  );
};

export default Hero;
