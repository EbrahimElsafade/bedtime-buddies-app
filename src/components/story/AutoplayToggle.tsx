import { Switch } from '@/components/ui/switch'
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
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const setSwitchDir = () => {
    if (isRTL) {
      if (currentSectionDir === 'ltr') return 'rtl'
    } else return currentSectionDir
  }

  return (
    <div
      className="flex items-center space-x-2 rtl:space-x-reverse"
      dir={currentSectionDir}
    >
      <Switch
        id="autoplay"
        checked={isAutoplay}
        onCheckedChange={onAutoplayChange}
        dir={setSwitchDir()}
      />
      <Label htmlFor="autoplay" className="text-sm font-medium">
        Autoplay
      </Label>
    </div>
  )
}
