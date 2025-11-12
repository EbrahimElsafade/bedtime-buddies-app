import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const GuessNumberGame = () => {
  const { t } = useTranslation('games')
  const [secret] = useState(() => Math.floor(Math.random() * 10) + 1)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [won, setWon] = useState(false)

  const submit = () => {
    const n = parseInt(guess, 10)
    if (isNaN(n)) return
    if (n === secret) {
      setFeedback(t('guessNumber.correct', { number: secret }))
      setWon(true)
    } else if (n < secret) {
      setFeedback(t('guessNumber.higher'))
    } else {
      setFeedback(t('guessNumber.lower'))
    }
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('guessNumber.title')}</CardTitle>
        <CardDescription>{t('guessNumber.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg">{t('guessNumber.prompt')}</div>
          <input value={guess} onChange={e => setGuess(e.target.value)} className="rounded border px-3 py-2 text-center" />
          <div className="flex gap-2">
            <Button onClick={submit}>{t('guessNumber.check')}</Button>
          </div>
          {feedback && <div className="text-sm text-muted-foreground">{feedback}</div>}
          {won && <div className="text-green-600 font-bold">{t('guessNumber.won')}</div>}
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  )
}

export default GuessNumberGame
