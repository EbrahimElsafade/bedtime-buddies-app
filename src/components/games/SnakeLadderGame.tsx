import { useState } from 'react'
import { Dices, RefreshCw, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LadderIcon = ({ className = 'size-4' }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 94.36 122.88"
    className={`fill-yellow-400 stroke-black stroke-1 ${className}`}
  >
    <g>
      <path d="M61.33,84.97H22.27v-0.01c-0.12,0-0.24-0.01-0.36-0.04c-0.82-0.2-1.33-1.03-1.13-1.85l3.88-15.86 c0.11-0.74,0.75-1.3,1.52-1.3h39.07v0.01c0.12,0,0.24,0.01,0.36,0.04c0.82,0.2,1.33,1.03,1.13,1.85l-3.88,15.86 C62.74,84.41,62.1,84.97,61.33,84.97L61.33,84.97z M18.75,96.28h39.07v0.01c0.12,0,0.24,0.01,0.36,0.04 c0.82,0.2,1.33,1.03,1.13,1.85l-3.83,15.65c-0.4,1.66-0.09,3.33,0.73,4.68c0.82,1.35,2.16,2.39,3.82,2.79l0,0 c1.66,0.4,3.33,0.09,4.68-0.73c1.35-0.82,2.39-2.16,2.79-3.82L94.18,7.64c0.4-1.66,0.09-3.32-0.73-4.68 c-0.82-1.35-2.16-2.39-3.82-2.79c-1.66-0.4-3.33-0.09-4.68,0.73c-1.35,0.82-2.39,2.17-2.79,3.82l-4.6,18.82 c-0.11,0.74-0.75,1.3-1.52,1.3H36.97v-0.01c-0.12,0-0.24-0.01-0.36-0.04c-0.82-0.2-1.33-1.03-1.13-1.85l3.4-13.9 c0.4-1.66,0.09-3.32-0.73-4.68C37.32,3.03,35.99,2,34.33,1.59l-0.01,0C32.66,1.19,31,1.5,29.65,2.33 c-1.35,0.82-2.39,2.17-2.79,3.82L0.17,115.24c-0.4,1.66-0.09,3.32,0.73,4.68c0.82,1.35,2.16,2.39,3.82,2.79 c1.66,0.4,3.32,0.09,4.68-0.73c1.35-0.82,2.39-2.17,2.79-3.82l5.03-20.57C17.34,96.84,17.98,96.28,18.75,96.28L18.75,96.28z M33.45,36.16h39.07v0.01c0.12,0,0.24,0.01,0.36,0.04c0.82,0.2,1.33,1.03,1.13,1.85l-3.73,15.25c-0.11,0.74-0.75,1.3-1.52,1.3 H29.69V54.6c-0.12,0-0.24-0.01-0.36-0.04c-0.82-0.2-1.33-1.03-1.13-1.85l3.73-15.25C32.05,36.72,32.68,36.16,33.45,36.16 L33.45,36.16z" />
    </g>
  </svg>
)

const SnakeLadderGame = () => {
  const { t } = useTranslation('common')
  const BOARD_SIZE = 100
  const WINNING_POSITION = 100

  // Snakes and Ladders configuration
  const snakes = {
    16: 6,
    48: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78,
  }

  const ladders = {
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

  const [players, setPlayers] = useState([
    {
      id: 1,
      name: 'Player 1',
      position: 0,
      color: 'bg-blue-500',
      diceValue: 1,
    },
    { id: 2, name: 'Player 2', position: 0, color: 'bg-red-500', diceValue: 1 },
  ])

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [gameStatus, setGameStatus] = useState('')
  const [winner, setWinner] = useState(null)
  const [moveAnimation, setMoveAnimation] = useState(null)

  const rollDice = () => {
    if (isRolling || winner) return

    setIsRolling(true)
    setGameStatus('Rolling...')

    // Animate dice roll
    let rolls = 0
    const rollInterval = setInterval(() => {
      const newPlayers = [...players]
      newPlayers[currentPlayerIndex].diceValue =
        Math.floor(Math.random() * 6) + 1
      setPlayers(newPlayers)
      rolls++

      if (rolls > 10) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        const updatedPlayers = [...players]
        updatedPlayers[currentPlayerIndex].diceValue = finalValue
        setPlayers(updatedPlayers)
        movePlayer(finalValue)
      }
    }, 100)
  }

  const movePlayer = steps => {
    const currentPlayer = players[currentPlayerIndex]
    const newPosition = currentPlayer.position + steps

    // Can't move beyond 100
    if (newPosition > WINNING_POSITION) {
      setGameStatus(
        `${currentPlayer.name} needs exactly ${WINNING_POSITION - currentPlayer.position} to win!`,
      )
      setTimeout(() => {
        setIsRolling(false)
        nextTurn()
      }, 2000)
      return
    }

    setMoveAnimation({
      playerId: currentPlayer.id,
      targetPosition: newPosition,
    })

    // Check for snakes or ladders after a delay
    setTimeout(() => {
      let finalPosition = newPosition
      let message = `${currentPlayer.name} rolled ${steps} and moved to ${newPosition}`

      if (snakes[newPosition]) {
        finalPosition = snakes[newPosition]
        message += ` 🐍 Snake! Slides down to ${finalPosition}`
      } else if (ladders[newPosition]) {
        finalPosition = ladders[newPosition]
        message += ` Ladder! Climbs up to ${finalPosition}`
      }

      const newPlayers = [...players]
      newPlayers[currentPlayerIndex].position = finalPosition
      setPlayers(newPlayers)
      setGameStatus(message)
      setMoveAnimation(null)

      // Check for winner
      if (finalPosition === WINNING_POSITION) {
        setWinner(currentPlayer)
        setGameStatus(`🎉 ${currentPlayer.name} wins! 🎉`)
        setIsRolling(false)
      } else {
        setTimeout(() => {
          setIsRolling(false)
          nextTurn()
        }, 2000)
      }
    }, 800)
  }

  const nextTurn = () => {
    if (!winner) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
      // setGameStatus('')
    }
  }

  const resetGame = () => {
    setPlayers(players.map(p => ({ ...p, position: 0, diceValue: 1 })))
    setCurrentPlayerIndex(0)
    setWinner(null)
    setGameStatus('')
    setMoveAnimation(null)
  }

  const getPositionCoordinates = position => {
    if (position === 0) return { row: 10, col: -1 }

    const adjustedPos = position - 1
    const row = 9 - Math.floor(adjustedPos / 10)
    let col = adjustedPos % 10

    // Snake pattern - odd rows go right to left
    if (Math.floor(adjustedPos / 10) % 2 === 1) {
      col = 9 - col
    }

    return { row, col }
  }

  const renderBoard = () => {
    const cells = []
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cellNumber = (9 - row) * 10 + (row % 2 === 1 ? 9 - col : col) + 1
        const isSnake = snakes[cellNumber]
        const isLadder = ladders[cellNumber]

        const playersOnCell = players.filter(p => p.position === cellNumber)

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`relative flex flex-col items-center justify-center border border-gray-300 ${isSnake ? 'bg-red-100' : isLadder ? 'bg-green-100' : 'bg-white'} ${cellNumber === WINNING_POSITION ? 'bg-yellow-200' : ''} `}
          >
            <span className="text-xs font-bold text-gray-700">
              {cellNumber}
            </span>
            {isSnake && <span className="text-xs">🐍→{isSnake}</span>}
            {isLadder && (
              <span className="flex items-center gap-1 text-xs">
                <LadderIcon />
                →{isLadder}
              </span>
            )}

            <div className="absolute bottom-1 flex gap-1">
              {playersOnCell.map(player => (
                <div
                  key={player.id}
                  className={`h-3 w-3 rounded-full ${player.color} border-2 border-white`}
                />
              ))}
            </div>
          </div>,
        )
      }
    }
    return cells
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 flex items-center justify-center gap-4 text-4xl font-bold text-purple-800">
          <span>🐍</span>
          <span>{t('games.snakesAndLadders')}</span>
          <LadderIcon className="size-8" />
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-4 shadow-xl">
              <div className="grid aspect-square grid-cols-10 gap-1">
                {renderBoard()}
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            {/* Players */}
            <div className="rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Players</h2>
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`mb-3 rounded-lg border-2 p-4 ${index === currentPlayerIndex && !winner ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} `}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full ${player.color}`} />
                    <div className="flex-1">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-600">
                        Position: {player.position}
                      </div>
                    </div>
                    {winner && winner.id === player.id && (
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>

                  {/* Individual Dice */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`border-3 flex h-16 w-16 items-center justify-center rounded-lg border-gray-800 bg-white text-3xl font-bold ${isRolling && index === currentPlayerIndex ? 'animate-bounce' : ''} `}
                    >
                      {player.diceValue}
                    </div>

                    {index === currentPlayerIndex && !winner && (
                      <button
                        onClick={rollDice}
                        disabled={isRolling}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                          isRolling
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                        } transition-all`}
                      >
                        <Dices className="h-4 w-4" />
                        Roll
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            {winner && (
              <div className="rounded-lg bg-white p-6 shadow-xl">
                <button
                  onClick={resetGame}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 active:scale-95"
                >
                  <RefreshCw className="h-5 w-5" />
                  New Game
                </button>
              </div>
            )}

            {/* Status */}
            {gameStatus && (
              <div className="rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-2 font-semibold text-gray-800">Status:</h3>
                <p className="text-gray-700">{gameStatus}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SnakeLadderGame
