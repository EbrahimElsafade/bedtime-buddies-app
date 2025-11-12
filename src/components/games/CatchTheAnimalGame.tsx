import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const ANIMALS = ['rabbit', 'cat', 'dog', 'fox']

const CatchTheAnimalGame = () => {
  const { t } = useTranslation('games')
  const [target] = useState(() => ANIMALS[Math.floor(Math.random() * ANIMALS.length)])
  const [positions, setPositions] = useState(() => ANIMALS.map(() => ({ top: Math.random() * 220, left: Math.random() * 320 })))
  const [score, setScore] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setPositions(prev => prev.map(() => ({ top: Math.random() * 220, left: Math.random() * 320 })))
    }, 900)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleClick = (animal: string) => {
    if (animal === target) setScore(s => s + 1)
    else setScore(s => Math.max(0, s - 1))
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('catchAnimal.title')}</CardTitle>
        <CardDescription>{t('catchAnimal.description', { animal: t(`animals.${target}`) })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-56 w-full overflow-hidden rounded bg-gradient-to-b from-primary/10 to-primary/5">
          {ANIMALS.map((a, i) => (
            <button
              key={a}
              onClick={() => handleClick(a)}
              className="absolute h-12 w-12 rounded-full bg-white/90 shadow flex items-center justify-center"
              style={{ top: positions[i].top, left: positions[i].left }}
            >
              {t(`animals.${a}`)}
            </button>
          ))}
        </div>
        <div className="mt-3 text-center">{t('catchAnimal.score')}: {score}</div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button onClick={() => setScore(0)} className="flex-1">{t('catchAnimal.reset')}</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CatchTheAnimalGame
