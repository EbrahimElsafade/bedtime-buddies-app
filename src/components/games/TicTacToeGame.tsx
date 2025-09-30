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
import { useTranslation } from 'react-i18next'
import { Users, Bot } from 'lucide-react'

const TicTacToeGame = () => {
  const { t } = useTranslation('games')
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'player' | 'computer'>('player')
  const [gameStarted, setGameStarted] = useState(false)

  const calculateWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a]
      }
    }
    return null
  }

  const getEmptySquares = (squares: Array<string | null>) => {
    return squares
      .map((square, index) => (square === null ? index : null))
      .filter(val => val !== null)
  }

  const minimax = (
    squares: Array<string | null>,
    depth: number,
    isMaximizing: boolean,
  ): number => {
    const winner = calculateWinner(squares)

    if (winner === '⭕') return 10 - depth
    if (winner === '✖️') return depth - 10
    if (getEmptySquares(squares).length === 0) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = '⭕'
          const score = minimax(squares, depth + 1, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = '✖️'
          const score = minimax(squares, depth + 1, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const getBestMove = (squares: Array<string | null>) => {
    let bestScore = -Infinity
    let bestMove = -1

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = '⭕'
        const score = minimax(squares, 0, false)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  const makeComputerMove = (currentBoard: Array<string | null>) => {
    const bestMove = getBestMove(currentBoard)
    if (bestMove !== -1) {
      const newBoard = currentBoard.slice()
      newBoard[bestMove] = '⭕'
      setBoard(newBoard)
      setIsXNext(true)

      const gameWinner = calculateWinner(newBoard)
      if (gameWinner) {
        setWinner(gameWinner)
        toast.success(`${gameWinner} ${t('ticTacToe.won')}`)
      } else if (!newBoard.includes(null)) {
        setWinner('draw')
        toast.info(t('ticTacToe.draw'))
      }
    }
  }

  const handleClick = (i: number) => {
    if (winner || board[i] || !gameStarted) return

    const newBoard = board.slice()
    newBoard[i] = isXNext ? '✖️' : '⭕'
    setBoard(newBoard)
    setIsXNext(!isXNext)

    const gameWinner = calculateWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      toast.success(`${gameWinner} ${t('ticTacToe.won')}`)
      return
    } else if (!newBoard.includes(null)) {
      setWinner('draw')
      toast.info(t('ticTacToe.draw'))
      return
    }

    if (gameMode === 'computer' && isXNext) {
      setTimeout(() => {
        makeComputerMove(newBoard)
      }, 500)
    }
  }

  const startGameWithMode = (mode: 'player' | 'computer') => {
    setGameMode(mode)
    setGameStarted(true)
    resetGame()
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
  }

  const backToMenu = () => {
    setGameStarted(false)
    resetGame()
  }

  const renderSquare = (i: number) => {
    return (
      <button
        className="flex h-20 w-20 items-center justify-center rounded-md border border-primary/30 bg-secondary/70 text-2xl transition-colors hover:bg-secondary/90"
        onClick={() => handleClick(i)}
      >
        {board[i]}
      </button>
    )
  }

  if (!gameStarted) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('ticTacToe.title')}</CardTitle>
          <CardDescription>{t('ticTacToe.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-center text-lg font-medium">
                {t('ticTacToe.selectGameMode')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => startGameWithMode('player')}
                  className="rounded-lg border-2 border-gray-200 p-6 transition-all hover:scale-105 hover:border-primary"
                >
                  <Users className="mx-auto mb-3 h-12 w-12" />
                  <div className="text-center">
                    <div className="font-semibold">
                      {t('ticTacToe.playerVsPlayer')}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t('ticTacToe.playWithFriend')}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => startGameWithMode('computer')}
                  className="rounded-lg border-2 border-gray-200 p-6 transition-all hover:scale-105 hover:border-primary"
                >
                  <Bot className="mx-auto mb-3 h-12 w-12" />
                  <div className="text-center">
                    <div className="font-semibold">
                      {t('ticTacToe.playerVsComputer')}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t('ticTacToe.challengeAI')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {t('ticTacToe.title')} -{' '}
          {gameMode === 'computer'
            ? t('ticTacToe.vsComputer')
            : t('ticTacToe.vsPlayer')}
        </CardTitle>
        <CardDescription>{t('ticTacToe.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-4 text-lg font-medium">
            {winner
              ? winner === 'draw'
                ? t('ticTacToe.draw')
                : `${t('ticTacToe.winner')} ${winner}`
              : gameMode === 'computer'
                ? `${isXNext ? t('ticTacToe.yourTurn') : t('ticTacToe.computerThinking')}`
                : `${t('ticTacToe.nextPlayer')} ${isXNext ? '✖️' : '⭕'}`}
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }, (_, i) => renderSquare(i))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={resetGame} className="flex-1 bg-gradient-to-r from-primary/50 to-primary-foreground py-3 text-base font-semibold transition-all duration-300 hover:from-primary-foreground hover:to-primary/50 hover:text-secondary md:text-lg">
          {t('ticTacToe.newGame')}
        </Button>
        <Button onClick={backToMenu} variant="outline" className="flex-1">
          {t('ticTacToe.backToMenu')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default TicTacToeGame
