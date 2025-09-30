import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Diamond,
  Heart,
  Star,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Crown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MemoryCardGame = () => {
  const { t } = useTranslation('games')
  type IconComponent = React.ComponentType<{ className?: string }>
  const [cards, setCards] = useState<
    Array<{
      id: number
      icon: IconComponent
      color: string
      isFlipped: boolean
      isMatched: boolean
    }>
  >([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const cardIcons: Array<{ icon: IconComponent; color: string }> = [
    { icon: Diamond, color: 'text-purple-500' },
    { icon: Heart, color: 'text-red-500' },
    { icon: Star, color: 'text-yellow-500' },
    { icon: Circle, color: 'text-blue-500' },
    { icon: Square, color: 'text-green-500' },
    { icon: Triangle, color: 'text-orange-500' },
    { icon: Hexagon, color: 'text-indigo-500' },
    { icon: Crown, color: 'text-pink-500' },
  ]

  const initializeGame = () => {
    const gameCards = []
    for (let i = 0; i < cardIcons.length; i++) {
      gameCards.push({
        id: i * 2,
        icon: cardIcons[i].icon,
        color: cardIcons[i].color,
        isFlipped: false,
        isMatched: false,
      })
      gameCards.push({
        id: i * 2 + 1,
        icon: cardIcons[i].icon,
        color: cardIcons[i].color,
        isFlipped: false,
        isMatched: false,
      })
    }

    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameStatus('playing')
    setTimeElapsed(0)
    setGameStarted(true)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameStatus])

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2 || gameStatus !== 'playing') return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    setCards(prevCards =>
      prevCards.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c)),
    )

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)

      const [firstCardId, secondCardId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstCardId)
      const secondCard = cards.find(c => c.id === secondCardId)

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isMatched: true }
                : c,
            ),
          )
          setFlippedCards([])
          setMatchedPairs(prev => {
            const newMatchedPairs = prev + 1
            if (newMatchedPairs === cardIcons.length) {
              setGameStatus('won')
              toast.success(
                t('games.memory.gameCompleted', { moves: moves + 1 }),
              )
            }
            return newMatchedPairs
          })
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCardId || c.id === secondCardId
                ? { ...c, isFlipped: false }
                : c,
            ),
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!gameStarted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-2">
        <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
          <CardHeader className="px-4 py-6 text-center">
            <CardTitle className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-xl font-bold md:text-2xl">
              {t('memory.title')}
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              {t('memory.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col items-center space-y-4 md:space-y-6">
              <div className="text-center">
                <div className="mb-4 text-4xl md:text-6xl">🧠</div>
                <h3 className="mb-2 text-lg font-semibold md:text-xl">
                  {t('memory.testYourMemory')}
                </h3>
                <p className="mb-4 px-2 text-sm text-muted-foreground md:mb-6 md:text-base">
                  {t('memory.clickToFlip')}
                </p>
              </div>
              <Button
                onClick={initializeGame}
                className="w-full max-w-xs bg-gradient-to-r from-primary to-primary-foreground px-6 py-3 text-base font-semibold hover:from-primary-foreground hover:to-primary hover:text-secondary md:px-8 md:py-4 md:text-lg"
              >
                {t('memory.startGame')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-2">
      <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
        <CardHeader className="px-4 py-4 text-center">
          <CardTitle className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-xl font-bold md:text-2xl">
            {t('memory.title')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {t('memory.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="rounded-lg bg-gradient-to-r from-ocean-surface to-wave-light px-3 py-2 text-center md:px-6 md:py-3">
                <div className="text-lg font-bold text-primary md:text-2xl">
                  {moves}
                </div>
                <div className="text-xs text-muted-foreground md:text-sm">
                  {t('memory.moves')}
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-coral-soft to-coral-light px-3 py-2 text-center md:px-6 md:py-3">
                <div className="text-lg font-bold text-coral-dark md:text-2xl">
                  {matchedPairs}/{cardIcons.length}
                </div>
                <div className="text-xs text-muted-foreground md:text-sm">
                  Pairs
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-sunshine-glow to-sunshine-light px-3 py-2 text-center md:px-6 md:py-3">
                <div className="text-lg font-bold text-sunshine-dark md:text-2xl">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-xs text-muted-foreground md:text-sm">
                  Time
                </div>
              </div>
            </div>

            {gameStatus === 'won' && (
              <div className="py-4 text-center">
                <div className="mb-2 text-3xl md:text-4xl">🎉</div>
                <div className="mb-2 animate-pulse text-xl font-bold text-green-600 md:text-2xl">
                  {t('memory.congratulations')}
                </div>
                <div className="text-sm text-muted-foreground md:text-base">
                  {t('memory.gameCompleted', { moves })}
                </div>
              </div>
            )}

            <div className="mx-auto grid max-w-sm grid-cols-4 gap-2 md:gap-4">
              {cards.map(card => {
                const IconComponent = card.icon
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={
                      card.isMatched ||
                      card.isFlipped ||
                      gameStatus !== 'playing'
                    }
                    className={`relative h-16 w-16 transform rounded-lg border-2 transition-all duration-300 hover:scale-105 md:h-20 md:w-20 ${
                      card.isMatched
                        ? 'border-coral-light bg-coral-soft opacity-75'
                        : card.isFlipped
                          ? 'bg-secondary shadow-lg'
                          : 'bg-gradient-to-br from-primary/80 to-primary-foreground/80 hover:from-primary-foreground/80 hover:to-primary/80'
                    } ${gameStatus !== 'playing' ? 'cursor-not-allowed' : 'cursor-pointer'} `}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <IconComponent
                        className={`mx-auto h-6 w-6 md:h-8 md:w-8 ${card.color}`}
                      />
                    ) : (
                      <div className="text-lg md:text-2xl">❓</div>
                    )}

                    {card.isMatched && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-500/20">
                        <div className="text-lg text-green-600 md:text-xl">
                          ✓
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-4">
          <Button
            onClick={initializeGame}
            className="w-full bg-gradient-to-r from-primary to-primary-foreground py-3 text-base font-semibold transition-all duration-300 hover:from-primary-foreground hover:to-primary hover:text-secondary md:text-lg"
          >
            {t('memory.playAgain')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default MemoryCardGame
