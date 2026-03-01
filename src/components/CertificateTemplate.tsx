import React from 'react'
import { useTranslation } from 'react-i18next'

export interface CertificateTemplateProps {
  recipientName: string
  courseTitle: string

  instructorName?: string
  ceoName?: string
  dateIssued?: string
  certificateCode?: string
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  recipientName,
  courseTitle,

  instructorName = 'Dolphoon',
  ceoName = 'Ibrahim Elsafade',
  dateIssued = new Date().toLocaleDateString(),
  certificateCode = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
}) => {
  const { t } = useTranslation('certificate')

  return (
    <div className="relative mx-auto w-full max-w-4xl bg-gradient-to-b from-primary/10 to-white p-12">
      {/* Outer decorative border */}
      <div className="relative border-8 border-primary bg-white p-8 shadow-2xl">
        {/* Inner decorative line */}
        <div className="pointer-events-none absolute inset-4 border-2 border-primary/70"></div>

        {/* Decorative corners */}
        <div className="absolute left-4 top-4 h-8 w-8 border-l-4 border-t-4 border-primary"></div>
        <div className="absolute right-4 top-4 h-8 w-8 border-r-4 border-t-4 border-primary"></div>
        <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-primary"></div>
        <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-primary"></div>

        <div className="relative z-10 space-y-6 px-8 text-center">
          {/* Logo area */}
          <div className="mb-4 flex justify-center">
            <img
              src="/icons/icon-192x192.png"
              alt="logo"
              className="h-20 w-auto"
            />
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl font-bold text-primary">
            {t('title')}
          </h1>

          <div className="mx-auto h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

          {/* Subtitle and name */}
          <div className="space-y-4 py-8">
            <p className="text-xl font-semibold text-gray-700">
              {t('subtitle')}
            </p>
            <p className="font-serif text-4xl font-bold text-primary underline decoration-primary/60 decoration-2">
              {recipientName}
            </p>
          </div>

          {/* Main text block */}
          <div className="mx-auto max-w-2xl space-y-4 border-b-4 border-t-4 border-primary/70 px-8 py-6">
            <p className="text-lg leading-relaxed text-gray-800">
              {t('forCompleting')}
            </p>
            <p className="font-serif text-2xl font-bold text-primary">
              {courseTitle}
            </p>
            <p className="text-lg leading-relaxed text-gray-800">
              {t('offeredBy')}{' '}
              <span className="font-bold text-primary">
                {t('organizationName')}
              </span>
            </p>
          </div>

          {/* Signature block */}
          <div className="mt-16 grid grid-cols-4 gap-4">
            <div className="space-y-8">
              <div className="h-1 w-full bg-primary"></div>
              <p className="text-sm font-semibold text-gray-700">
                {instructorName}
              </p>
              <p className="text-xs text-gray-600"> {t('instructorLabel')} </p>
            </div>

            <div className="space-y-8">
              <div className="h-1 w-full bg-primary"></div>
              <p className="text-sm font-semibold text-gray-700">{ceoName}</p>

              <p className="text-xs text-gray-600">{t('ceoLabel')}</p>
            </div>

            <div className="space-y-8">
              <div className="h-1 w-full bg-primary"></div>
              <p className="text-sm font-semibold text-gray-700">
                {dateIssued}
              </p>
              <p className="text-xs text-gray-600"> {t('dateOfIssue')} </p>
            </div>

            <div className="space-y-8">
              <div className="h-1 w-full bg-primary"></div>
              <p className="text-sm font-semibold text-gray-700">
                {certificateCode}
              </p>
              <p className="text-xs text-gray-600"> {t('certificateCode')} </p>
            </div>
          </div>

          {/* Footer text */}
          <div className="mt-12 border-t border-primary/70 pt-6">
            <p className="text-xs text-gray-600">
              {`© ${new Date().getFullYear()} ${t('organizationName')}. ${t('title')}. ${t('footer')}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateTemplate
