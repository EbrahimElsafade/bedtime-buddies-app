
import { Toggle } from '@/components/ui/toggle'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

interface AutoplayToggleProps {
  isAutoplay: boolean
  onAutoplayChange: (enabled: boolean) => void
  currentSectionDir: 'rtl' | 'ltr'
}

export const AutoplayToggle = ({
  isAutoplay,
  onAutoplayChange,
  currentSectionDir,
}: AutoplayToggleProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const setToggleDir = () => {
    if (isRTL) {
      if (currentSectionDir === 'ltr') return 'rtl'
    } else return currentSectionDir
  }

  return (
    <div
      className="flex items-center gap-4"
      dir={currentSectionDir}
    >
      <Label htmlFor="autoplay" className="text-sm font-medium">
        {t('stories.auto-play')}
      </Label>

      <Toggle
        id="autoplay"
        pressed={isAutoplay}
        onPressedChange={onAutoplayChange}
        dir={setToggleDir()}
        variant="outline"
        size="sm"
      >
        Auto
      </Toggle>
    </div>
  )
}
