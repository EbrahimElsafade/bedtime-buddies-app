import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { DolphoonMascot } from '@/components/DolphoonMascot'

const Hero = () => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation('hero')
  const { t: tCommon } = useTranslation('common')

  return (
    <section className="relative overflow-hidden px-4 py-8 md:py-12">
      <div className="container relative z-10 mx-auto">
        <div className="mx-auto grid max-w-4xl gap-12 text-center">
          {/* Dolphoon mascot */}
          <div className="flex justify-center">
            <DolphoonMascot size="xl" expression="cheering" animate={false} />
          </div>

          <h1 className="animate-slide-up font-bubbly text-2xl leading-tight text-secondary drop-shadow-lg sm:text-3xl md:text-4xl lg:text-6xl">
            {t('title')}
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-primary-foreground sm:text-lg md:text-xl">
            {t('subtitle')}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row md:gap-4">
            <Link to="/stories" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="accent"
                className="w-full rounded-full sm:w-auto"
              >
                {t('exploreButton')}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>

            {!isAuthenticated && (
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="tertiary"
                  className="w-full rounded-full sm:w-auto"
                >
                  {t('signUpButton')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ocean-themed decorative elements */}
      <div className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 transform animate-float rounded-full bg-gradient-to-br from-white/60 to-white/20 md:left-10 md:h-20 md:w-20"></div>

      <div className="to-sunshine-DEFAULT absolute bottom-6 right-4 h-8 w-8 animate-bubble rounded-full bg-gradient-to-tl from-sunshine-light delay-1000 md:bottom-10 md:right-10 md:h-12 md:w-12"></div>

      <div className="absolute right-12 top-6 h-6 w-6 animate-wave rounded-full bg-gradient-to-r from-white/20 to-white/50 md:right-20 md:top-10 md:h-8 md:w-8"></div>

      <div className="absolute left-1/4 top-1/4 h-4 w-4 animate-bubble rounded-full bg-secondary/50 delay-500"></div>

      <div className="delay-[1s,500ms] absolute bottom-1/4 right-1/4 h-6 w-6 animate-float rounded-full bg-secondary/20"></div>

      <div className="delay-[2s] absolute left-3/4 top-3/4 h-3 w-3 animate-wave rounded-full bg-secondary/40"></div>

      {/* Additional decorative elements */}
      <div className="delay-[800ms] absolute left-[15%] top-[60%] h-5 w-5 animate-float rounded-full bg-gradient-to-tr from-white/40 to-white/10 md:h-8 md:w-8"></div>

      <div className="to-sunshine-DEFAULT delay-[1500ms] absolute right-[35%] top-[15%] h-4 w-4 animate-bubble rounded-full bg-gradient-to-bl from-sunshine-light md:h-6 md:w-6"></div>

      <div className="delay-[1200ms] absolute bottom-[35%] right-[15%] h-7 w-7 animate-wave rounded-full bg-gradient-to-r from-white/30 to-white/60 md:h-10 md:w-10"></div>

      <div className="delay-[2500ms] absolute left-[40%] top-[75%] h-3 w-3 animate-bubble rounded-full bg-secondary/60 md:h-5 md:w-5"></div>

      <div className="delay-[1800ms] absolute right-[45%] top-[40%] h-6 w-6 animate-float rounded-full bg-gradient-to-tl from-white/50 to-white/20 md:h-9 md:w-9"></div>

      <div className="to-sunshine-DEFAULT/40 delay-[2200ms] absolute bottom-[20%] left-[20%] h-4 w-4 animate-wave rounded-full bg-gradient-to-br from-sunshine-light/40 md:h-7 md:w-7"></div>
    </section>
  )
}

export default Hero
