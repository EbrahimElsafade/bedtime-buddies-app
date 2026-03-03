import { useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { Button } from '@/components/ui/button'
import { Download, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import dolphoonLogo from '@/assets/dolphoon-logo-removebg-preview.png'

interface CertificateTemplateProps {
  studentName: string
  courseTitle: string
  completionDate: string
  certificateId: string
}

export const CertificateTemplate = ({
  studentName,
  courseTitle,
  completionDate,
  certificateId,
}: CertificateTemplateProps) => {
  const { t } = useTranslation(['common'])
  const certRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(async () => {
    if (!certRef.current) return
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `certificate-${certificateId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to generate certificate image', err)
    }
  }, [certificateId])

  return (
    <div className="space-y-4">
      {/* Certificate Preview */}
      <div
        ref={certRef}
        className="relative mx-auto aspect-[1.414/1] w-full overflow-hidden bg-[#faf6ee]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {/* Outer border */}
        <div className="absolute inset-3 border-2 border-[#5c4033]" />
        {/* Inner border */}
        <div className="absolute inset-5 border border-[#5c4033]/40" />

        {/* Corner ornaments */}
        <OrnamentCorner className="left-4 top-4" />
        <OrnamentCorner className="right-4 top-4 -scale-x-100" />
        <OrnamentCorner className="bottom-4 left-4 -scale-y-100" />
        <OrnamentCorner className="bottom-4 right-4 -scale-x-100 -scale-y-100" />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-between px-8 py-10 sm:px-12 sm:py-14">
          {/* Top row */}
          <div className="flex w-full items-start justify-between text-[0.55rem] text-[#5c4033]/70 sm:text-xs">
            <span>
              {t('certificateId')}: {certificateId}
            </span>
            <span>
              {t('issuingDate')}: {completionDate}
            </span>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-2 text-center sm:gap-4">
            <h1 className="text-lg font-bold tracking-widest text-[#3b2314] sm:text-2xl md:text-3xl">
              {t('completionCertificate')}
            </h1>

            <div className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-[#5c4033]/80 sm:mt-2 sm:text-xs">
              {t('presentedTo')}
            </div>

            <div className="mt-1 border-b-2 border-[#5c4033]/30 px-6 pb-1 text-xl font-bold text-[#3b2314] sm:text-3xl md:text-4xl">
              {studentName}
            </div>

            <p className="mt-1 max-w-[80%] text-[0.6rem] leading-relaxed text-[#5c4033]/80 sm:mt-2 sm:text-sm">
              {t('graduatedFrom')}{' '}
              <span className="font-bold text-[#3b2314]">{courseTitle}</span>.{' '}
              {t('certificateDescription')}
            </p>
          </div>

          {/* Bottom row with logo */}
          <div className="flex w-full items-end justify-center">
            <div className="flex flex-col items-center gap-1">
              <img
                src={dolphoonLogo}
                alt="Dolphoon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                crossOrigin="anonymous"
              />
              <span className="text-[0.5rem] text-[#5c4033]/60 sm:text-[0.65rem]">
                Dolphoon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button onClick={handleDownload} className="w-full gap-2">
        <Download className="h-4 w-4" />
        {t('downloadCertificate')}
      </Button>
    </div>
  )
}

/** Simple SVG corner ornament */
const OrnamentCorner = ({ className }: { className?: string }) => (
  <svg
    className={`absolute h-8 w-8 text-[#5c4033]/60 sm:h-10 sm:w-10 ${className}`}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5 C5 5 5 50 5 50 C5 50 15 40 25 35 C35 30 50 30 50 30 C50 30 30 25 20 15 C15 10 5 5 5 5Z"
      fill="currentColor"
      opacity="0.3"
    />
    <path
      d="M5 5 C20 8 35 15 45 25 C55 35 58 50 60 60"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M5 15 C15 18 25 22 32 30 C38 37 42 48 44 55"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.6"
    />
    <circle cx="60" cy="60" r="2" fill="currentColor" opacity="0.5" />
    <circle cx="44" cy="55" r="1.5" fill="currentColor" opacity="0.4" />
  </svg>
)
