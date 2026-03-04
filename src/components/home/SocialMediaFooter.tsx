import { Facebook, Linkedin, Instagram } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SocialMediaFooter = () => {
  const { t } = useTranslation(['social'])

  return (
    <section className="px-4 pb-4 sm:pb-0">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4">
        <span className="text-sm font-medium">{t('followUs')}</span>

        <div className="flex items-center gap-4">
          <a
            href="https://www.tiktok.com/@thedolphoon?_r=1&_t=ZS-94OMSeeVi7T"
            aria-label={t('tiktok')}
            title={t('tiktok')}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex size-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="size-5 text-primary group-hover:text-muted"
            >
              <path d="M224,80a52.059,52.059,0,0,1-52-52,4.0002,4.0002,0,0,0-4-4H128a4.0002,4.0002,0,0,0-4,4V156a24,24,0,1,1-34.28418-21.69238,3.99957,3.99957,0,0,0,2.28369-3.61279L92,89.05569a3.99948,3.99948,0,0,0-4.70117-3.938A72.00522,72.00522,0,1,0,172,156l-.00049-42.56348A99.27749,99.27749,0,0,0,224,128a4.0002,4.0002,0,0,0,4-4V84A4.0002,4.0002,0,0,0,224,80Zm-4,39.915a91.24721,91.24721,0,0,1-49.66455-17.1792,4.00019,4.00019,0,0,0-6.33594,3.24707L164,156A64,64,0,1,1,84,94.01223l-.00049,34.271A32.00156,32.00156,0,1,0,132,156V32h32.13184A60.09757,60.09757,0,0,0,220,87.86819Z" />
            </svg>
          </a>

          <a
            href="https://www.facebook.com/share/18RsWCTvAx/?mibextid=wwXIfr"
            aria-label={t('facebook')}
            title={t('facebook')}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex size-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Facebook className="size-5 text-primary group-hover:text-muted" />
          </a>

          <a
            href="https://www.linkedin.com/company/thedolphoon/"
            aria-label={t('linkedin')}
            title={t('linkedin')}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex size-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Linkedin className="size-5 text-primary group-hover:text-muted" />
          </a>

          <a
            href="https://www.instagram.com/thedolphoon?igsh=MTY3cHZwMnNldTQ4bA=="
            aria-label={t('instagram')}
            title={t('instagram')}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex size-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Instagram className="size-5 text-primary group-hover:text-muted" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default SocialMediaFooter
