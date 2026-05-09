import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import HeroSkillPathCard from './HeroSkillPathCard'

const skillPathsMini = [
  {
    icon: '🤖',
    title: 'الذكاء الاصطناعي للأطفال',
    subtitle: '٢٧ درس • مبتدئ',
  },
  {
    icon: '💻',
    title: 'البرمجة بـ Scratch',
    subtitle: '٩٦ درس • متوسط',
  },
  {
    icon: '♟️',
    title: 'تعلّم الشطرنج',
    subtitle: '٥٧ درس • كل المستويات',
  },
]

const Hero = () => {
  const { t } = useTranslation('hero')

  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-16">
      <div className="container relative z-10 mx-auto">
        {/* Main Hero Grid */}
        <div className="mb-12 flex flex-col items-center my-32 justify-between gap-16 md:flex-row md:items-start">
          {/* Left Side - Content */}
          <div className="flex flex-col justify-center">

            <h1 className="animate-slide-up font-bubbly text-2xl leading-tight text-accent drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
              {t('name')}
            </h1>

            <h1 className="animate-slide-up mt-4 font-bubbly text-2xl leading-tight text-secondary drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
              {t('title')}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-primary-foreground sm:text-lg md:text-xl">
              {t('subtitle')}
            </p>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row md:gap-4">
              <Link to="/stories" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="tertiary"
                  className="w-full rounded-full sm:w-auto"
                >
                  {t('exploreButton')}
                  <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>

              <Link to="/courses" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="accent"
                  className="w-full rounded-full sm:w-auto"
                >
                  {t('exploreButton2')}
                  <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Skill Path Cards */}
          <div className="flex my-auto flex-col gap-4">
            {skillPathsMini.map((path, index) => (
              <div key={index} className={index % 2 === 1 ? 'ms-4' : ''}>
                <HeroSkillPathCard
                  icon={path.icon}
                  title={path.title}
                  subtitle={path.subtitle}
                  delay={index * 0.5}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ocean-themed decorative elements */}
      <div className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 transform animate-float rounded-full bg-gradient-to-br from-white/60 to-white/20 md:left-10 md:h-20 md:w-20"></div>

      <div className="to-sunshine-DEFAULT absolute bottom-6 right-4 h-8 w-8 animate-bubble rounded-full bg-gradient-to-tl from-sunshine-light delay-1000 md:bottom-10 md:right-10 md:h-12 md:w-12"></div>

      <div className="absolute right-12 top-6 h-6 w-6 animate-wave rounded-full bg-gradient-to-r from-white/20 to-white/50 md:right-20 md:top-10 md:h-8 md:w-8"></div>

      <div className="absolute left-1/4 top-1/4 h-4 w-4 animate-bubble rounded-full bg-secondary/50 delay-500"></div>

      <div
        className="absolute bottom-1/4 right-1/4 h-6 w-6 animate-float rounded-full bg-secondary/20"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div
        className="absolute left-3/4 top-3/4 h-3 w-3 animate-wave rounded-full bg-secondary/40"
        style={{ animationDelay: '2s' }}
      ></div>

      {/* Additional decorative elements */}
      <div
        className="absolute left-[15%] top-[60%] h-5 w-5 animate-float rounded-full bg-gradient-to-tr from-white/40 to-white/10 md:h-8 md:w-8"
        style={{ animationDelay: '800ms' }}
      ></div>

      <div
        className="to-sunshine-DEFAULT absolute right-[35%] top-[15%] h-4 w-4 animate-bubble rounded-full bg-gradient-to-bl from-sunshine-light md:h-6 md:w-6"
        style={{ animationDelay: '1500ms' }}
      ></div>

      <div
        className="absolute bottom-[35%] right-[15%] h-7 w-7 animate-wave rounded-full bg-gradient-to-r from-white/30 to-white/60 md:h-10 md:w-10"
        style={{ animationDelay: '1200ms' }}
      ></div>

      <div
        className="absolute left-[40%] top-[75%] h-3 w-3 animate-bubble rounded-full bg-secondary/60 md:h-5 md:w-5"
        style={{ animationDelay: '2500ms' }}
      ></div>

      <div
        className="absolute right-[45%] top-[40%] h-6 w-6 animate-float rounded-full bg-gradient-to-tl from-white/50 to-white/20 md:h-9 md:w-9"
        style={{ animationDelay: '1800ms' }}
      ></div>

      <div
        className="to-sunshine-DEFAULT/40 absolute bottom-[20%] left-[20%] h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-sunshine-light/40 md:h-7 md:w-7"
        style={{ animationDelay: '2200ms' }}
      ></div>
    </section>
  )
}

export default Hero
