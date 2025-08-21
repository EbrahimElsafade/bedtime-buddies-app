import { Toggle } from '@/components/ui/toggle'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

interface AutoplayToggleProps {
  isAutoplay: boolean
  onAutoplayChange: (enabled: boolean) => void
}

export const AutoplayToggle = ({
  isAutoplay,
  onAutoplayChange,
}: AutoplayToggleProps) => {
  const { t } = useTranslation('stories')

  return (
    <Toggle
      id="autoplay"
      className="md:my-auto h-fit py-0.5 my-0.5 hover:translate-y-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
      pressed={isAutoplay}
      onPressedChange={onAutoplayChange}
      variant='outline'
      >
      {/* size="sm" */}
      {t('autoPlay')}
    </Toggle>
  )
}
