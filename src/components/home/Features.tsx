import { Gamepad2, Languages, LibraryBig } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Features = () => {
  const { t } = useTranslation('features')

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="container mx-auto">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
          <h2 className="mb-3 font-bubbly text-xl text-primary-foreground md:mb-4 md:text-2xl lg:text-3xl">
            {t('title')}
          </h2>
          <p className="text-sm text-primary-foreground md:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <div className="rounded-xl bg-secondary/70 p-4 backdrop-blur-sm md:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary md:mb-4 md:h-12 md:w-12">
              <span className="text-xl md:text-2xl">
                <LibraryBig />
              </span>
            </div>
            <h3 className="mb-2 font-bubbly text-lg text-primary-foreground md:text-xl">
              {t('soothing.title')}
            </h3>
            <p className="text-sm text-primary-foreground md:text-base">
              {t('soothing.desc')}
            </p>
          </div>

          <div className="rounded-xl bg-secondary/70 p-4 backdrop-blur-sm md:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary md:mb-4 md:h-12 md:w-12">
              <span className="text-xl md:text-2xl">
                <Languages />
              </span>
            </div>
            <h3 className="mb-2 font-bubbly text-lg text-primary-foreground md:text-xl">
              {t('languages.title')}
            </h3>
            <p className="text-sm text-primary-foreground md:text-base">
              {t('languages.desc')}
            </p>
          </div>

          <div className="rounded-xl bg-secondary/70 p-4 backdrop-blur-sm md:col-span-2 md:p-6 lg:col-span-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary md:mb-4 md:h-12 md:w-12">
              <span className="text-xl md:text-2xl">
                <Gamepad2 />
              </span>
            </div>
            <h3 className="mb-2 font-bubbly text-lg text-primary-foreground md:text-xl">
              {t('games.title')}
            </h3>
            <p className="text-sm text-primary-foreground md:text-base">
              {t('games.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
