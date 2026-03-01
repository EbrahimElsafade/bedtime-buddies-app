import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCourseData } from '@/hooks/useCourseData'
import { getLocalized } from '@/utils/getLocalized'
import CertificateTemplate from '@/components/CertificateTemplate'

const CourseCertificate = () => {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'certificate'])
  const { profile } = useAuth()
  const { data: course, isLoading } = useCourseData(courseId)
  const certificateRef = useRef<HTMLDivElement>(null)
  const lang = document.documentElement.lang as 'en' | 'ar' | 'fr'

  const handleDownload = async () => {
    if (!certificateRef.current) return

    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const link = document.createElement('a')
    link.download = `certificate-${getLocalized(course, 'title', lang)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-primary-foreground">{t('common:loading')}</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-primary-foreground">{t('course.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/courses')} className="mt-4">
          <ArrowLeft className="me-2 h-4 w-4" /> {t('button.backToCourses')}
        </Button>
      </div>
    )
  }

  const recipientName = profile?.child_name || profile?.parent_name || '—'
  const courseTitle = getLocalized(course, 'title', lang)
  const instructorName = course.instructor
    ? getLocalized(course.instructor, 'name', lang)
    : undefined

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-8">
      <div className="container mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button variant="tertiary" onClick={() => navigate(`/courses/${courseId}`)} className="rounded-md shadow">
            <ArrowLeft className="me-1 h-4 w-4 rtl:rotate-180" /> {t('button.backToCourses')}
          </Button>

          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            {t('courses:button.downloadCertificate')}
          </Button>
        </div>

        <div ref={certificateRef}>
          <CertificateTemplate
            recipientName={recipientName}
            courseTitle={courseTitle}
            instructorName={instructorName}
          />
        </div>
      </div>
    </div>
  )
}

export default CourseCertificate
