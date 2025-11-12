import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import TicTacToeGame from '@/components/games/TicTacToeGame'
import RockPaperScissorsGame from '@/components/games/RockPaperScissorsGame'
import HangmanGame from '@/components/games/HangmanGame'
import MemoryCardGame from '@/components/games/MemoryCardGame'
import SnakeGame from '@/components/games/SnakeGame'
import ChooseColorGame from '@/components/games/ChooseColorGame'
import GuessNumberGame from '@/components/games/GuessNumberGame'
import CatchTheAnimalGame from '@/components/games/CatchTheAnimalGame'
import PicturePuzzleGame from '@/components/games/PicturePuzzleGame'
import WhereDidItGoGame from '@/components/games/WhereDidItGoGame'
import SnakeLadderGame from '@/components/games/SnakeLadderGame'

const GAMES = {
  'tic-tac-toe': {
    title: 'ticTacToe.title',
    description: 'ticTacToe.description',
    component: TicTacToeGame,
  },
  hangman: {
    title: 'hangman.title',
    description: 'hangman.description',
    component: HangmanGame,
  },
  memory: {
    title: 'memory.title',
    description: 'memory.description',
    component: MemoryCardGame,
  },
  snake: {
    title: 'snake.title',
    description: 'snake.description',
    component: SnakeGame,
  },
  'rock-paper-scissors': {
    title: 'rockPaperScissors.title',
    description: 'rockPaperScissors.description',
    component: RockPaperScissorsGame,
  },
  'choose-color': {
    title: 'chooseColor.title',
    description: 'chooseColor.description',
    component: ChooseColorGame,
  },
  'guess-number': {
    title: 'guessNumber.title',
    description: 'guessNumber.description',
    component: GuessNumberGame,
  },
  'catch-animal': {
    title: 'catchAnimal.title',
    description: 'catchAnimal.description',
    component: CatchTheAnimalGame,
  },
  puzzle: {
    title: 'puzzle.title',
    description: 'puzzle.description',
    component: PicturePuzzleGame,
  },
  'where-did-it-go': {
    title: 'whereDidIt.title',
    description: 'whereDidIt.description',
    component: WhereDidItGoGame,
  },
  'snake-ladder': {
    title: 'snakeLadder.title',
    description: 'snakeLadder.description',
    component: SnakeLadderGame,
  },
}

type GameId = keyof typeof GAMES

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['games', 'common', 'navigation', 'meta'])

  useEffect(() => {
    if (!gameId || !GAMES[gameId as GameId]) {
      navigate('/games')
    }
  }, [gameId, navigate])

  if (!gameId || !GAMES[gameId as GameId]) {
    return null
  }

  const game = GAMES[gameId as GameId]
  const GameComponent = game.component

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-4 md:px-4 md:py-8 lg:py-12">
      <Helmet>
        <title>{t(game.title)} - {t('meta:titles.games')}</title>
        <meta name="description" content={t(game.description)} />
        <meta property="og:title" content={t(game.title)} />
        <meta property="og:description" content={t(game.description)} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/games')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="bg-gradient-to-r from-primary-foreground to-purple-600 bg-clip-text text-2xl font-bold md:text-3xl lg:text-4xl">
              {t(game.title)}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {t(game.description)}
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl rounded-lg">
          <GameComponent />
        </div>
      </div>
    </div>
  )
}

export default GamePage
