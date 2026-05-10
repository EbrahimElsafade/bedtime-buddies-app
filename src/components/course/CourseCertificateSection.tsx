import { useState } from 'react'
import { GraduationCap, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CertificateTemplate } from '@/components/profile/CertificateTemplate'
import { Course } from '@/types/course'
import { cn } from '@/lib/utils'

interface CourseCertificateSectionProps {
  course: Pick<Course, 'id' | 'title_en' | 'title_ar' | 'title_fr'>
  studentName: string
  progress: number
  isComplete: boolean
  compact?: boolean
}

export const CourseCertificateSection = ({
  course,
  studentName,
  progress,
  isComplete,
  compact = false,
}: CourseCertificateSectionProps) => {
  const { t } = useTranslation(['common'])
  const [open, setOpen] = useState(false)

  const button = (
    <Button
      variant={isComplete ? 'accent' : 'secondary'}
      disabled={!isComplete}
      onClick={() => setOpen(true)}
      className={cn(!isComplete && 'cursor-not-allowed')}
    >
      {isComplete ? (
        <GraduationCap className="h-4 w-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      {t('getCertificate')}
    </Button>
  )

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 rounded-xl border border-primary/20 bg-secondary/50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between',
        compact && 'p-3',
      )}
    >
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm font-medium text-primary-foreground">
          <span>{t('courseProgress')}</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <Progress
          value={progress}
          className="h-2 transition-all duration-500"
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span wrapper so tooltip works on disabled button */}
            <span tabIndex={0}>{button}</span>
          </TooltipTrigger>
          {!isComplete && (
            <TooltipContent>{t('completeAllLessonsTooltip')}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {t('getCertificate')}
            </DialogTitle>
          </DialogHeader>
          <CertificateTemplate
            studentName={studentName}
            courseTitle={course.title_en || ''}
            courseTitleAr={course.title_ar || undefined}
            courseTitleFr={course.title_fr || undefined}
            completionDate={new Date().toLocaleDateString()}
            certificateId={course.id.slice(0, 15).toUpperCase()}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
