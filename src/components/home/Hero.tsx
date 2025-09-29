import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { DolfoonMascot } from '@/components/DolfoonMascot'

const Hero = () => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation('hero')
  const { t: tCommon } = useTranslation('common')

  return (
    <section className="bg-gradient-to-b from-primary/40 to-primary/20 relative overflow-hidden px-4 py-8 md:py-12 lg:py-20">
      {/* Ocean background elements */}
      <div className="bubbles-bg absolute inset-0 opacity-20" />
      <div className="waves-bg absolute bottom-0 left-0 w-full opacity-30" />

      <div className="container relative z-10 mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          {/* Dolfoon mascot */}
          <div className="mb-6 flex justify-center">
            <DolfoonMascot size="xl" expression="cheering" animate={false} />
          </div>

          <h1 className="animate-slide-up mb-3 font-bubbly text-2xl leading-tight text-background drop-shadow-lg sm:text-3xl md:mb-4 md:text-4xl lg:text-6xl">
            {t('title')}
          </h1>

          {/* Tagline */}
          <p
            className="animate-fade-in mb-4 font-rounded text-lg text-background/90 md:text-xl"
            style={{ animationDelay: '0.1s' }}
          >
            {tCommon('tagline')}
          </p>

          <p
            className="animate-fade-in mx-auto mb-6 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg md:mb-8 md:text-xl"
            style={{ animationDelay: '0.2s' }}
          >
            {t('subtitle')}
          </p>
          <div
            className="animate-fade-in flex flex-col items-center justify-center gap-3 sm:flex-row md:gap-4"
            style={{ animationDelay: '0.4s' }}
          >
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
                  variant="outline-accent"
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
      <div
        className="to-sunshine-DEFAULT absolute bottom-6 right-4 h-8 w-8 animate-bubble rounded-full bg-gradient-to-tl from-sunshine-light md:bottom-10 md:right-10 md:h-12 md:w-12"
        style={{ animationDelay: '1s' }}
      ></div>
      <div className="absolute right-12 top-6 h-6 w-6 animate-wave rounded-full bg-gradient-to-r from-white/20 to-white/50 md:right-20 md:top-10 md:h-8 md:w-8"></div>

      {/* Additional ocean elements */}
      <div
        className="absolute left-1/4 top-1/4 h-4 w-4 animate-bubble rounded-full bg-background/50"
        style={{ animationDelay: '0.5s' }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 h-6 w-6 animate-float rounded-full bg-background/20"
        style={{ animationDelay: '1.5s' }}
      ></div>
      <div
        className="absolute left-3/4 top-3/4 h-3 w-3 animate-wave rounded-full bg-background/40"
        style={{ animationDelay: '2s' }}
      ></div>
    </section>
  )
}

export default Hero
