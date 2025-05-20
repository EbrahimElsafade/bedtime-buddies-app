
import { Baby, Star, Rocket, BookOpen, Cake } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FunElements = () => {
  const { t } = useLanguage();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating elements that animate around */}
      <div className="absolute top-[10%] left-[5%] animate-float" style={{ animationDelay: "0s" }}>
        <Star className="h-8 w-8 text-moon-DEFAULT opacity-60" />
      </div>
      <div className="absolute top-[15%] right-[10%] animate-float" style={{ animationDelay: "1.5s" }}>
        <Baby className="h-10 w-10 text-dream-light opacity-70" />
      </div>
      <div className="absolute top-[30%] left-[15%] animate-float" style={{ animationDelay: "2.3s" }}>
        <Rocket className="h-9 w-9 text-dream-DEFAULT opacity-60" />
      </div>
      <div className="absolute top-[45%] right-[5%] animate-float" style={{ animationDelay: "3.1s" }}>
        <BookOpen className="h-8 w-8 text-moon-light opacity-70" />
      </div>
      <div className="absolute top-[60%] left-[8%] animate-float" style={{ animationDelay: "0.8s" }}>
        <Cake className="h-10 w-10 text-dream-DEFAULT opacity-60" />
      </div>
      
      {/* Decorative circles with opacity */}
      <div className="absolute top-[20%] left-[25%] w-20 h-20 rounded-full bg-dream-light opacity-10 animate-float" style={{ animationDelay: "1.9s" }}></div>
      <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-moon-light opacity-15 animate-float" style={{ animationDelay: "3.5s" }}></div>
      <div className="absolute top-[70%] right-[30%] w-24 h-24 rounded-full bg-dream-DEFAULT opacity-5 animate-float" style={{ animationDelay: "2.7s" }}></div>
      
      {/* Fun shapes */}
      <div className="absolute top-[75%] left-[20%] w-16 h-16 rotate-45 bg-moon-DEFAULT opacity-10 animate-float" style={{ animationDelay: "1.2s" }}></div>
      <div className="absolute top-[55%] right-[15%] w-0 h-0 border-l-[20px] border-l-transparent border-b-[40px] border-b-dream-light border-r-[20px] border-r-transparent opacity-20 animate-float" style={{ animationDelay: "0.5s" }}></div>
    </div>
  );
};

export default FunElements;
