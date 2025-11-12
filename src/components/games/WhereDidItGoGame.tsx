import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const ITEMS = ['apple', 'ball', 'star']

const WhereDidItGoGame = () => {
  const { t } = useTranslation('games')
  const [visible, setVisible] = useState(ITEMS.map(() => true))
  const [hiddenIndex, setHiddenIndex] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // show items for 2 seconds then hide one
    setVisible(ITEMS.map(() => true))
    const timer = setTimeout(() => {
      const idx = Math.floor(Math.random() * ITEMS.length)
      setVisible(prev => prev.map((v, i) => (i === idx ? false : v)))
      setHiddenIndex(idx)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handlePick = (i: number) => {
    if (hiddenIndex === null) return
    if (i === hiddenIndex) setMessage(t('whereDidIt.goCorrect'))
    else setMessage(t('whereDidIt.tryAgain'))
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('whereDidIt.title')}</CardTitle>
        <CardDescription>{t('whereDidIt.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4">
          {ITEMS.map((it, i) => (
            <button key={it} onClick={() => handlePick(i)} className="h-16 w-16 rounded bg-white/90 shadow flex items-center justify-center text-2xl">
              {visible[i] ? t(`items.${it}`) : '❓'}
            </button>
          ))}
        </div>
        {message && <div className="mt-3 text-center text-sm text-muted-foreground">{message}</div>}
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button onClick={() => window.location.reload()} className="flex-1">{t('whereDidIt.playAgain')}</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default WhereDidItGoGame
