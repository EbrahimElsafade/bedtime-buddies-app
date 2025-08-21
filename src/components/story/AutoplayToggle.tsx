
import { Badge } from '@/components/ui/badge'
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

  const handleClick = () => {
    onAutoplayChange(!isAutoplay)
  }

  return (
    <Badge
      variant={isAutoplay ? "default" : "outline"}
      className="cursor-pointer h-fit my-auto hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      {t('stories.autoPlay')}
    </Badge>
  )
}
