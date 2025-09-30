import {
  Baby,
  Star,
  Rocket,
  BookOpen,
  Cake,
  Heart,
  Crown,
  Zap,
  Sparkles,
  Music,
  Gift,
  CircleDot,
} from 'lucide-react'

const FunElements = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* First layer - Main floating icons */}
      <div
        className="absolute left-[3%] top-[8%] animate-float"
        style={{ animationDelay: '0s' }}
      >
        <Star className="text-moon-DEFAULT animate-twinkle h-8 w-8 opacity-70" />
      </div>
      <div
        className="absolute right-[8%] top-[12%] animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <Baby className="h-10 w-10 text-primary opacity-80" />
      </div>
      <div
        className="absolute left-[12%] top-[25%] animate-float"
        style={{ animationDelay: '2.3s' }}
      >
        <Rocket className="h-9 w-9 text-primary-foreground opacity-70" />
      </div>
      <div
        className="absolute right-[4%] top-[40%] animate-float"
        style={{ animationDelay: '3.1s' }}
      >
        <BookOpen className="text-moon-light h-8 w-8 opacity-80" />
      </div>
      <div
        className="absolute left-[6%] top-[55%] animate-float"
        style={{ animationDelay: '0.8s' }}
      >
        <Cake className="h-10 w-10 text-primary-foreground opacity-70" />
      </div>

      {/* Second layer - Additional fun icons */}
      <div
        className="absolute left-[25%] top-[18%] animate-float"
        style={{ animationDelay: '1.2s' }}
      >
        <Heart className="text-moon-DEFAULT animate-twinkle h-7 w-7 opacity-60" />
      </div>
      <div
        className="absolute right-[15%] top-[35%] animate-float"
        style={{ animationDelay: '2.8s' }}
      >
        <Crown className="h-8 w-8 text-primary opacity-70" />
      </div>
      <div
        className="absolute left-[20%] top-[65%] animate-float"
        style={{ animationDelay: '1.7s' }}
      >
        <Zap className="text-moon-light animate-twinkle h-7 w-7 opacity-65" />
      </div>
      <div
        className="absolute right-[25%] top-[75%] animate-float"
        style={{ animationDelay: '3.5s' }}
      >
        <Sparkles className="h-9 w-9 text-primary-foreground opacity-75" />
      </div>
      <div
        className="absolute right-[30%] top-[22%] animate-float"
        style={{ animationDelay: '0.5s' }}
      >
        <Music className="text-moon-DEFAULT h-8 w-8 opacity-65" />
      </div>
      <div
        className="absolute left-[30%] top-[48%] animate-float"
        style={{ animationDelay: '2.1s' }}
      >
        <Gift className="h-8 w-8 text-primary opacity-70" />
      </div>
      <div
        className="absolute left-[35%] top-[82%] animate-float"
        style={{ animationDelay: '1.9s' }}
      >
        <CircleDot className="text-moon-light h-9 w-9 opacity-60" />
      </div>

      {/* Third layer - Small twinkling stars */}
      <div
        className="animate-twinkle absolute left-[45%] top-[15%]"
        style={{ animationDelay: '0.3s' }}
      >
        <Star className="h-4 w-4 text-primary opacity-50" />
      </div>
      <div
        className="animate-twinkle absolute right-[40%] top-[68%]"
        style={{ animationDelay: '2.4s' }}
      >
        <Star className="text-moon-DEFAULT h-5 w-5 opacity-60" />
      </div>
      <div
        className="animate-twinkle absolute left-[50%] top-[32%]"
        style={{ animationDelay: '1.6s' }}
      >
        <Star className="h-4 w-4 text-primary-foreground opacity-45" />
      </div>
      <div
        className="animate-twinkle absolute right-[50%] top-[85%]"
        style={{ animationDelay: '3.2s' }}
      >
        <Star className="text-moon-light h-5 w-5 opacity-55" />
      </div>

      {/* Decorative circles with enhanced effects */}
      <div
        className="absolute left-[22%] top-[16%] h-20 w-20 animate-float rounded-full bg-gradient-to-br from-primary/15 to-primary-foreground/5 blur-sm"
        style={{ animationDelay: '1.9s' }}
      ></div>
      <div
        className="from-moon-light/20 to-moon-DEFAULT/8 absolute right-[18%] top-[38%] h-16 w-16 animate-float rounded-full bg-gradient-to-tr blur-sm"
        style={{ animationDelay: '3.5s' }}
      ></div>
      <div
        className="from-primary-foreground/8 to-primary/3 absolute right-[28%] top-[72%] h-24 w-24 animate-float rounded-full bg-gradient-to-bl blur-md"
        style={{ animationDelay: '2.7s' }}
      ></div>
      <div
        className="from-moon-DEFAULT/12 to-moon-light/6 absolute left-[35%] top-[28%] h-14 w-14 animate-float rounded-full bg-gradient-to-tl blur-sm"
        style={{ animationDelay: '0.9s' }}
      ></div>

      {/* Fun geometric shapes */}
      <div
        className="from-moon-DEFAULT/12 to-moon-light/8 absolute left-[18%] top-[78%] h-16 w-16 rotate-45 animate-float rounded-lg bg-gradient-to-r"
        style={{ animationDelay: '1.2s' }}
      ></div>
      <div
        className="absolute right-[12%] top-[52%] h-0 w-0 animate-float border-b-[40px] border-l-[20px] border-r-[20px] border-b-primary/25 border-l-transparent border-r-transparent"
        style={{ animationDelay: '0.5s' }}
      ></div>
      <div
        className="absolute left-[40%] top-[11%] h-12 w-12 animate-float rounded-full bg-gradient-to-br from-primary-foreground/15 to-primary/10"
        style={{ animationDelay: '2.9s' }}
      ></div>
      <div
        className="from-moon-light/18 to-moon-DEFAULT/12 absolute right-[35%] top-[61%] h-20 w-10 animate-float rounded-full bg-gradient-to-t"
        style={{ animationDelay: '1.4s' }}
      ></div>

      {/* Magical sparkle trails */}
      <div
        className="animate-twinkle absolute left-[60%] top-[20%] h-2 w-2 rounded-full bg-primary"
        style={{ animationDelay: '0.7s' }}
      ></div>
      <div
        className="bg-moon-DEFAULT animate-twinkle absolute left-[62%] top-[22%] h-1 w-1 rounded-full"
        style={{ animationDelay: '1.1s' }}
      ></div>
      <div
        className="animate-twinkle absolute left-[64%] top-[24%] h-1.5 w-1.5 rounded-full bg-primary-foreground"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div
        className="bg-moon-light animate-twinkle absolute right-[55%] top-[45%] h-2 w-2 rounded-full"
        style={{ animationDelay: '2.2s' }}
      ></div>
      <div
        className="animate-twinkle absolute right-[53%] top-[47%] h-1 w-1 rounded-full bg-primary"
        style={{ animationDelay: '2.6s' }}
      ></div>
      <div
        className="bg-moon-DEFAULT animate-twinkle absolute right-[51%] top-[49%] h-1.5 w-1.5 rounded-full"
        style={{ animationDelay: '3.0s' }}
      ></div>

      {/* Floating bubbles */}
      <div
        className="absolute left-[55%] top-[35%] h-8 w-8 animate-float rounded-full border-2 border-primary/30"
        style={{ animationDelay: '1.8s' }}
      ></div>
      <div
        className="border-moon-DEFAULT/25 absolute left-[45%] top-[58%] h-6 w-6 animate-float rounded-full border-2"
        style={{ animationDelay: '2.5s' }}
      ></div>
      <div
        className="absolute right-[45%] top-[80%] h-10 w-10 animate-float rounded-full border-2 border-primary-foreground/20"
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  )
}

export default FunElements
