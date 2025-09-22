
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { DalfoonMascot } from "@/components/DalfoonMascot";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('hero');
  const { t: tCommon } = useTranslation('common');
  
  return (
    <section className="py-8 md:py-12 lg:py-20 px-4 relative overflow-hidden ocean-gradient">
      {/* Ocean background elements */}
      <div className="absolute inset-0 bubbles-bg opacity-20" />
      <div className="absolute bottom-0 left-0 w-full waves-bg opacity-30" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Dalfoon mascot */}
          <div className="mb-6 flex justify-center">
            <DalfoonMascot size="xl" expression="cheering" animate />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bubbly mb-3 md:mb-4 text-white leading-tight animate-slide-up drop-shadow-lg">
            {t('title')}
          </h1>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl mb-4 text-white/90 font-rounded animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {tCommon('tagline')}
          </p>
          
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/80 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/stories" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-coral-DEFAULT hover:bg-coral-light text-white px-6 md:px-8 animate-bounce-gentle hover:animate-wiggle transition-all duration-300 shadow-lg">
                {t('exploreButton')} <ArrowRight className="rtl:rotate-180 ms-2 h-4 w-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-sunshine-DEFAULT text-sunshine-DEFAULT hover:bg-sunshine-DEFAULT hover:text-ocean-dark px-6 md:px-8 hover:animate-pulse-glow transition-all duration-300">
                  {t('signUpButton')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Ocean-themed decorative elements */}
      <div className="absolute top-1/2 left-4 md:left-10 transform -translate-y-1/2 w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-coral-light/40 to-coral-DEFAULT/20 animate-float"></div>
      <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-tl from-sunshine-light/30 to-sunshine-DEFAULT/15 animate-bubble" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-6 md:top-10 right-12 md:right-20 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-wave-DEFAULT/20 to-ocean-light/15 animate-wave"></div>
      
      {/* Additional ocean elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-sunshine-DEFAULT/30 rounded-full animate-bubble" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-coral-light/25 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-3/4 left-3/4 w-3 h-3 bg-wave-DEFAULT/40 rounded-full animate-wave" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};

export default Hero;
