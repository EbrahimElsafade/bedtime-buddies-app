import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const COLORS = [
  { name: 'red', className: 'bg-red-500' },
  { name: 'green', className: 'bg-green-500' },
  { name: 'blue', className: 'bg-blue-500' },
  { name: 'yellow', className: 'bg-yellow-400' },
  { name: 'purple', className: 'bg-purple-500' },
]

const ChooseColorGame = () => {
  const { t } = useTranslation('games')
  const [target, setTarget] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  const [showWordColor, setShowWordColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  const [message, setMessage] = useState<string | null>(null)

  const reset = () => {
    setTarget(COLORS[Math.floor(Math.random() * COLORS.length)])
    setShowWordColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    setMessage(null)
  }

  const handlePick = (colorName: string) => {
    if (colorName === target.name) {
      setMessage(t('chooseColor.correct'))
    } else {
      setMessage(t('chooseColor.tryAgain'))
    }
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('chooseColor.title')}</CardTitle>
        <CardDescription>{t('chooseColor.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className={`h-24 w-24 rounded-md ${target.className} shadow-lg`} />
          <div className={`text-xl font-bold ${showWordColor.className} text-white px-4 py-2 rounded`}>{t(`colors.${target.name}`)}</div>

          <div className="grid grid-cols-3 gap-3">
            {COLORS.map(c => (
              <button key={c.name} onClick={() => handlePick(c.name)} className={`h-12 w-24 rounded ${c.className} text-white`}>{t(`colors.${c.name}`)}</button>
            ))}
          </div>

          {message && <div className="mt-2 text-center text-sm text-muted-foreground">{message}</div>}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button onClick={reset} className="flex-1">{t('chooseColor.newRound')}</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChooseColorGame
