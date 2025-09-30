import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SnakeGame = () => {
  const { t, i18n } = useTranslation('games')
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>(
    'menu',
  )
  const [snake, setSnake] = useState([{ x: 5, y: 5 }])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore')
    return saved ? parseInt(saved) : 0
  })

  const gridSize = 30
  const gameSpeed = 100

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * gridSize) + 1,
      y: Math.floor(Math.random() * gridSize) + 1,
    }
  }, [gridSize])

  const resetGame = useCallback(() => {
    setSnake([{ x: 5, y: 5 }])
    setFood(generateFood())
    setDirection({ x: 0, y: 0 })
    setScore(0)
    setGameState('playing')
    setGameStarted(false)
  }, [generateFood])

  const gameOver = useCallback(() => {
    setGameState('gameOver')
    setGameStarted(false)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snakeHighScore', score.toString())
    }
  }, [score, highScore])

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing' || !gameStarted) return

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      head.x += direction.x
      head.y += direction.y

      // Check wall collision
      if (
        head.x <= 0 ||
        head.x > gridSize ||
        head.y <= 0 ||
        head.y > gridSize
      ) {
        gameOver()
        return currentSnake
      }

      // Check self collision
      if (
        newSnake.some(segment => segment.x === head.x && segment.y === head.y)
      ) {
        gameOver()
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1)
        setFood(generateFood())
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [
    direction,
    food,
    gameState,
    gameStarted,
    gameOver,
    generateFood,
    gridSize,
  ])

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, gameSpeed)
    return () => clearInterval(gameInterval)
  }, [moveSnake, gameSpeed])

  const handleDirectionChange = (newDirection: { x: number; y: number }) => {
    if (gameState !== 'playing') return

    // Prevent reverse direction
    if (
      (newDirection.x === 1 && direction.x === -1) ||
      (newDirection.x === -1 && direction.x === 1) ||
      (newDirection.y === 1 && direction.y === -1) ||
      (newDirection.y === -1 && direction.y === 1)
    ) {
      return
    }

    setDirection(newDirection)
    if (!gameStarted) {
      setGameStarted(true)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case 'ArrowUp':
          handleDirectionChange({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          handleDirectionChange({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          handleDirectionChange({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          handleDirectionChange({ x: 1, y: 0 })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameState, gameStarted])

  if (gameState === 'menu') {
    return (
      <Card className="overflow-hidden border-primary/20 bg-secondary/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {t('snake.title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('snake.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {highScore > 0 && (
              <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/20 to-primary/30 p-6 shadow-lg">
                <div className="mb-1 text-center text-sm text-gray-600">
                  {t('snake.highScore')}
                </div>
                <div className="text-center text-3xl font-bold text-primary-foreground">
                  {highScore}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <Button
            onClick={resetGame}
            className="w-full bg-gradient-to-r from-primary-foreground to-primary py-3 text-lg font-semibold text-secondary shadow-lg transition-all duration-300 hover:from-primary hover:to-primary-foreground hover:text-secondary hover:shadow-xl"
          >
            {t('snake.startGame')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (gameState === 'gameOver') {
    return (
      <Card className="overflow-hidden border-primary/20 bg-secondary/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            {t('snake.gameOver')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('snake.score')} {score}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {score === highScore && score > 0 && (
              <div className="animate-bounce text-lg font-bold text-primary-foreground">
                🎉 {t('snake.newHighScore')}
              </div>
            )}

            <div className="w-full max-w-sm rounded-xl border border-primary/20 bg-gradient-to-r from-primary/20 to-primary/30 p-6 shadow-lg">
              <div className="mb-1 text-center text-sm text-gray-600">
                {t('snake.highScore')}
              </div>
              <div className="text-center text-3xl font-bold text-primary-foreground">
                {highScore}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <Button
            onClick={resetGame}
            className="w-full bg-primary-foreground py-3 text-lg font-semibold text-secondary shadow-lg transition-all duration-300 hover:bg-primary hover:shadow-xl"
          >
            {t('snake.playAgain')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className="overflow-hidden border-primary/20 bg-secondary/80 shadow-xl backdrop-blur-sm"
      dir="ltr"
    >
      <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/30">
        <div className="flex items-center justify-between">
          <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/20 to-primary/30 px-4 py-2">
            <div className="text-sm text-gray-600">{t('snake.score')}</div>
            <div className="text-2xl font-bold text-primary-foreground">
              {score}
            </div>
          </div>
          <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/20 to-primary/30 px-4 py-2">
            <div className="text-sm text-gray-600">{t('snake.highScore')}</div>
            <div className="text-2xl font-bold text-primary-foreground">
              {highScore}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6" dir="ltr">
        <div className="relative mb-6 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 p-4 shadow-inner">
          <div
            className="mx-auto grid h-full max-h-[min(70vw,70vh)] w-full max-w-[min(70vw,70vh)] gap-0 rounded border border-gray-200 bg-secondary/90 shadow-sm"
            style={{
              gridTemplate: `repeat(${gridSize}, 1fr) / repeat(${gridSize}, 1fr)`,
              aspectRatio: '1',
            }}
          >
            {/* Food */}
            <div
              className="animate-pulse rounded-sm bg-gradient-to-br from-red-400 to-red-600 shadow-sm"
              style={{
                gridArea: `${food.y} / ${food.x}`,
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`${
                  index === 0
                    ? 'bg-gradient-to-br from-green-300 to-green-500'
                    : 'bg-gradient-to-br from-green-400 to-green-600'
                } rounded-sm shadow-sm`}
                style={{
                  gridArea: `${segment.y} / ${segment.x}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile Controls - Fixed LTR */}
        <div
          className="mx-auto grid max-w-48 grid-cols-3 gap-2 md:hidden"
          dir="ltr"
        >
          <div></div>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="flex items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/30 p-4 shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowUp size={24} className="text-primary-foreground" />
          </button>
          <div></div>

          <button
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            className="flex items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/30 p-4 shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={24} className="text-primary-foreground" />
          </button>
          <div></div>
          <button
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            className="flex items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/30 p-4 shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowRight size={24} className="text-primary-foreground" />
          </button>

          <div></div>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            className="flex items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/30 p-4 shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowDown size={24} className="text-primary-foreground" />
          </button>
          <div></div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {!gameStarted && gameState === 'playing'
              ? 'Press an arrow key to start!'
              : 'Use arrow keys to control the snake'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SnakeGame
