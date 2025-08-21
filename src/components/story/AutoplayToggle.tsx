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
  const { t } = useTranslation()

  return (
    <Toggle
      id="autoplay"
      className='hover:translate-y-0 my-auto h-fit data-[state=on]:bg-accent data-[state=on]:text-accent-foreground'
      pressed={isAutoplay}
      onPressedChange={onAutoplayChange}
      size="sm"
    >
      {t('stories.autoPlay')}
    </Toggle>
  )
}
