import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SocialMediaFooter from '../home/SocialMediaFooter'

interface FooterProps {
  navItems: Array<{
    name: string
    path: string
    icon: React.ElementType
    key: string
  }>
}

export const Footer = ({ navItems }: FooterProps) => {
  const { t } = useTranslation(['misc'])

  return (
    <>
      <div className="block border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 py-6 sm:hidden">
        <SocialMediaFooter />
      </div>

      <footer className="hidden border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 py-6 md:block">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center gap-4">
            {navItems.slice(0, 4).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm text-primary hover:text-primary-foreground"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/subscription"
              className="text-coral-DEFAULT text-sm hover:text-coral-dark"
            >
              {t('misc:layout.subscribe')}
            </Link>
          </div>

          <SocialMediaFooter />

          <p className="mt-4 text-xs text-primary">
            © {new Date().getFullYear()} {t('misc:layout.appName')}.{' '}
            {t('misc:layout.copyright')}
          </p>
        </div>
      </footer>
    </>
  )
}
