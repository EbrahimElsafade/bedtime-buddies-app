
import { Baby, Star, Rocket, BookOpen, Cake, Heart, Crown, Zap, Sparkles, Music, Gift, CircleDot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FunElements = () => {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* First layer - Main floating icons */}
      <div className="absolute top-[8%] left-[3%] animate-float" style={{ animationDelay: "0s" }}>
        <Star className="h-8 w-8 text-moon-DEFAULT opacity-70 animate-twinkle" />
      </div>
      <div className="absolute top-[12%] right-[8%] animate-float" style={{ animationDelay: "1.5s" }}>
        <Baby className="h-10 w-10 text-ocean-light opacity-80" />
      </div>
      <div className="absolute top-[25%] left-[12%] animate-float" style={{ animationDelay: "2.3s" }}>
        <Rocket className="h-9 w-9 text-ocean-DEFAULT opacity-70" />
      </div>
      <div className="absolute top-[40%] right-[4%] animate-float" style={{ animationDelay: "3.1s" }}>
        <BookOpen className="h-8 w-8 text-moon-light opacity-80" />
      </div>
      <div className="absolute top-[55%] left-[6%] animate-float" style={{ animationDelay: "0.8s" }}>
        <Cake className="h-10 w-10 text-ocean-DEFAULT opacity-70" />
      </div>
      
      {/* Second layer - Additional fun icons */}
      <div className="absolute top-[18%] left-[25%] animate-float" style={{ animationDelay: "1.2s" }}>
        <Heart className="h-7 w-7 text-moon-DEFAULT opacity-60 animate-twinkle" />
      </div>
      <div className="absolute top-[35%] right-[15%] animate-float" style={{ animationDelay: "2.8s" }}>
        <Crown className="h-8 w-8 text-ocean-light opacity-70" />
      </div>
      <div className="absolute top-[65%] left-[20%] animate-float" style={{ animationDelay: "1.7s" }}>
        <Zap className="h-7 w-7 text-moon-light opacity-65 animate-twinkle" />
      </div>
      <div className="absolute top-[75%] right-[25%] animate-float" style={{ animationDelay: "3.5s" }}>
        <Sparkles className="h-9 w-9 text-ocean-DEFAULT opacity-75" />
      </div>
      <div className="absolute top-[22%] right-[30%] animate-float" style={{ animationDelay: "0.5s" }}>
        <Music className="h-8 w-8 text-moon-DEFAULT opacity-65" />
      </div>
      <div className="absolute top-[48%] left-[30%] animate-float" style={{ animationDelay: "2.1s" }}>
        <Gift className="h-8 w-8 text-ocean-light opacity-70" />
      </div>
      <div className="absolute top-[82%] left-[35%] animate-float" style={{ animationDelay: "1.9s" }}>
        <CircleDot className="h-9 w-9 text-moon-light opacity-60" />
      </div>
      
      {/* Third layer - Small twinkling stars */}
      <div className="absolute top-[15%] left-[45%] animate-twinkle" style={{ animationDelay: "0.3s" }}>
        <Star className="h-4 w-4 text-ocean-light opacity-50" />
      </div>
      <div className="absolute top-[68%] right-[40%] animate-twinkle" style={{ animationDelay: "2.4s" }}>
        <Star className="h-5 w-5 text-moon-DEFAULT opacity-60" />
      </div>
      <div className="absolute top-[32%] left-[50%] animate-twinkle" style={{ animationDelay: "1.6s" }}>
        <Star className="h-4 w-4 text-ocean-DEFAULT opacity-45" />
      </div>
      <div className="absolute top-[85%] right-[50%] animate-twinkle" style={{ animationDelay: "3.2s" }}>
        <Star className="h-5 w-5 text-moon-light opacity-55" />
      </div>
      
      {/* Decorative circles with enhanced effects */}
      <div className="absolute top-[16%] left-[22%] w-20 h-20 rounded-full bg-gradient-to-br from-ocean-light/15 to-ocean-DEFAULT/5 animate-float blur-sm" style={{ animationDelay: "1.9s" }}></div>
      <div className="absolute top-[38%] right-[18%] w-16 h-16 rounded-full bg-gradient-to-tr from-moon-light/20 to-moon-DEFAULT/8 animate-float blur-sm" style={{ animationDelay: "3.5s" }}></div>
      <div className="absolute top-[72%] right-[28%] w-24 h-24 rounded-full bg-gradient-to-bl from-ocean-DEFAULT/8 to-ocean-light/3 animate-float blur-md" style={{ animationDelay: "2.7s" }}></div>
      <div className="absolute top-[28%] left-[35%] w-14 h-14 rounded-full bg-gradient-to-tl from-moon-DEFAULT/12 to-moon-light/6 animate-float blur-sm" style={{ animationDelay: "0.9s" }}></div>
      
      {/* Fun geometric shapes */}
      <div className="absolute top-[78%] left-[18%] w-16 h-16 rotate-45 bg-gradient-to-r from-moon-DEFAULT/12 to-moon-light/8 animate-float rounded-lg" style={{ animationDelay: "1.2s" }}></div>
      <div className="absolute top-[52%] right-[12%] w-0 h-0 border-l-[20px] border-l-transparent border-b-[40px] border-b-ocean-light/25 border-r-[20px] border-r-transparent animate-float" style={{ animationDelay: "0.5s" }}></div>
      <div className="absolute top-[11%] left-[40%] w-12 h-12 bg-gradient-to-br from-ocean-DEFAULT/15 to-ocean-light/10 rounded-full animate-float" style={{ animationDelay: "2.9s" }}></div>
      <div className="absolute top-[61%] right-[35%] w-10 h-20 bg-gradient-to-t from-moon-light/18 to-moon-DEFAULT/12 rounded-full animate-float" style={{ animationDelay: "1.4s" }}></div>
      
      {/* Magical sparkle trails */}
      <div className="absolute top-[20%] left-[60%] w-2 h-2 bg-ocean-light rounded-full animate-twinkle" style={{ animationDelay: "0.7s" }}></div>
      <div className="absolute top-[22%] left-[62%] w-1 h-1 bg-moon-DEFAULT rounded-full animate-twinkle" style={{ animationDelay: "1.1s" }}></div>
      <div className="absolute top-[24%] left-[64%] w-1.5 h-1.5 bg-ocean-DEFAULT rounded-full animate-twinkle" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="absolute top-[45%] right-[55%] w-2 h-2 bg-moon-light rounded-full animate-twinkle" style={{ animationDelay: "2.2s" }}></div>
      <div className="absolute top-[47%] right-[53%] w-1 h-1 bg-ocean-light rounded-full animate-twinkle" style={{ animationDelay: "2.6s" }}></div>
      <div className="absolute top-[49%] right-[51%] w-1.5 h-1.5 bg-moon-DEFAULT rounded-full animate-twinkle" style={{ animationDelay: "3.0s" }}></div>
      
      {/* Floating bubbles */}
      <div className="absolute top-[35%] left-[55%] w-8 h-8 rounded-full border-2 border-ocean-light/30 animate-float" style={{ animationDelay: "1.8s" }}></div>
      <div className="absolute top-[58%] left-[45%] w-6 h-6 rounded-full border-2 border-moon-DEFAULT/25 animate-float" style={{ animationDelay: "2.5s" }}></div>
      <div className="absolute top-[80%] right-[45%] w-10 h-10 rounded-full border-2 border-ocean-DEFAULT/20 animate-float" style={{ animationDelay: "0.4s" }}></div>
    </div>
  );
};

export default FunElements;
