
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  return (
    <section className="py-12 md:py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bubbly mb-4 text-dream-DEFAULT">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-dream-DEFAULT dark:text-foreground">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/stories">
              <Button size="lg" className="rounded-full bg-dream-DEFAULT hover:bg-dream-dark hover:text-white text-black dark:text-white">
                {t('hero.exploreButton')} <ArrowRight className="rtl:rotate-180 ms-2 h-4 w-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-full border-dream-light dark:text-dream-DEFAULT">
                  {t('hero.signUpButton')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-10 transform -translate-y-1/2 w-20 h-20 rounded-full bg-moon-light opacity-30 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full bg-dream-light opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-10 right-20 w-8 h-8 rounded-full bg-dream-DEFAULT opacity-10 animate-twinkle"></div>
    </section>
  );
};

export default Hero;
