import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { Dices } from 'lucide-react'

const SNAKES = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
}

const LADDERS = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
}

const SnakeLadderGame = () => {
  const { t } = useTranslation('games')
  const [playerPos, setPlayerPos] = useState(0)
  const [computerPos, setComputerPos] = useState(0)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'computer'>('player')
  const [winner, setWinner] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isRolling, setIsRolling] = useState(false)

  const rollDice = () => {
    if (winner || isRolling) return
    setIsRolling(true)
    
    const dice = Math.floor(Math.random() * 6) + 1
    setDiceValue(dice)
    
    setTimeout(() => {
      movePlayer(dice)
      setIsRolling(false)
    }, 500)
  }

  const movePlayer = (dice: number) => {
    const isPlayer = currentPlayer === 'player'
    const currentPos = isPlayer ? playerPos : computerPos
    let newPos = currentPos + dice

    if (newPos > 100) {
      setMessage(t('snakeLadder.exactRoll'))
      setCurrentPlayer(isPlayer ? 'computer' : 'player')
      if (currentPlayer === 'player') {
        setTimeout(() => computerTurn(), 1500)
      }
      return
    }

    // Check for snake
    if (SNAKES[newPos as keyof typeof SNAKES]) {
      const snakeEnd = SNAKES[newPos as keyof typeof SNAKES]
      setMessage(t('snakeLadder.snakeBite', { from: newPos, to: snakeEnd }))
      newPos = snakeEnd
    }
    // Check for ladder
    else if (LADDERS[newPos as keyof typeof LADDERS]) {
      const ladderEnd = LADDERS[newPos as keyof typeof LADDERS]
      setMessage(t('snakeLadder.climbLadder', { from: newPos, to: ladderEnd }))
      newPos = ladderEnd
    } else {
      setMessage('')
    }

    if (isPlayer) {
      setPlayerPos(newPos)
    } else {
      setComputerPos(newPos)
    }

    if (newPos === 100) {
      setWinner(isPlayer ? t('snakeLadder.youWin') : t('snakeLadder.computerWins'))
    } else {
      setCurrentPlayer(isPlayer ? 'computer' : 'player')
      if (isPlayer) {
        setTimeout(() => computerTurn(), 1500)
      }
    }
  }

  const computerTurn = () => {
    if (winner) return
    const dice = Math.floor(Math.random() * 6) + 1
    setDiceValue(dice)
    setTimeout(() => movePlayer(dice), 500)
  }

  const resetGame = () => {
    setPlayerPos(0)
    setComputerPos(0)
    setDiceValue(null)
    setCurrentPlayer('player')
    setWinner(null)
    setMessage('')
    setIsRolling(false)
  }

  const renderCell = (num: number) => {
    const hasSnake = SNAKES[num as keyof typeof SNAKES]
    const hasLadder = LADDERS[num as keyof typeof LADDERS]
    const hasPlayer = playerPos === num
    const hasComputer = computerPos === num

    return (
      <div
        key={num}
        className={`flex h-12 w-12 items-center justify-center rounded border text-xs font-semibold md:h-14 md:w-14 md:text-sm ${
          hasSnake
            ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
            : hasLadder
              ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
              : 'border-border bg-card'
        }`}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-muted-foreground">{num}</span>
          <div className="flex gap-1">
            {hasPlayer && <span className="text-lg">🔵</span>}
            {hasComputer && <span className="text-lg">🔴</span>}
          </div>
        </div>
      </div>
    )
  }

  const renderBoard = () => {
    const rows = []
    for (let i = 9; i >= 0; i--) {
      const row = []
      const isEvenRow = i % 2 === 0
      for (let j = 0; j < 10; j++) {
        const cellNum = i * 10 + (isEvenRow ? j + 1 : 10 - j)
        row.push(renderCell(cellNum))
      }
      rows.push(
        <div key={i} className="flex gap-1">
          {row}
        </div>
      )
    }
    return rows
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="p-4 md:p-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔵</span>
              <div>
                <p className="text-xs text-muted-foreground">{t('snakeLadder.you')}</p>
                <p className="font-bold">{playerPos}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="text-xs text-muted-foreground">{t('snakeLadder.computer')}</p>
                <p className="font-bold">{computerPos}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {diceValue && (
              <div className={`text-4xl ${isRolling ? 'animate-bounce' : ''}`}>
                🎲 {diceValue}
              </div>
            )}
            <p className="text-sm font-medium">
              {winner ? winner : currentPlayer === 'player' ? t('snakeLadder.yourTurn') : t('snakeLadder.computerTurn')}
            </p>
            {message && <p className="text-xs text-muted-foreground">{message}</p>}
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-1">{renderBoard()}</div>

        <div className="flex gap-2">
          <Button
            onClick={rollDice}
            disabled={winner !== null || currentPlayer === 'computer' || isRolling}
            className="flex-1"
          >
            <Dices className="mr-2 h-4 w-4" />
            {t('snakeLadder.rollDice')}
          </Button>
          <Button onClick={resetGame} variant="outline">
            {t('snakeLadder.newGame')}
          </Button>
        </div>
      </Card>

      <Card className="w-full p-4">
        <h3 className="mb-2 font-semibold">{t('snakeLadder.legend')}</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border border-red-500 bg-red-100 dark:bg-red-900/30"></div>
            <span>{t('snakeLadder.snakes')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border border-green-500 bg-green-100 dark:bg-green-900/30"></div>
            <span>{t('snakeLadder.ladders')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SnakeLadderGame
