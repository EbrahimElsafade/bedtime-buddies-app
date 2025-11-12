import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const Games = () => {
  const { t } = useTranslation(['games', 'common', 'navigation', 'meta'])

  const games = [
    {
      id: 'tic-tac-toe',
      title: 'ticTacToe.title',
      description: 'ticTacToe.description',
      icon: '⭕',
    },
    {
      id: 'hangman',
      title: 'hangman.title',
      description: 'hangman.description',
      icon: '🎯',
    },
    {
      id: 'memory',
      title: 'memory.title',
      description: 'memory.description',
      icon: '🧠',
    },
    {
      id: 'snake',
      title: 'snake.title',
      description: 'snake.description',
      icon: '🐍',
    },
    {
      id: 'rock-paper-scissors',
      title: 'rockPaperScissors.title',
      description: 'rockPaperScissors.description',
      icon: '✂️',
    },
    {
      id: 'choose-color',
      title: 'chooseColor.title',
      description: 'chooseColor.description',
      icon: '🎨',
    },
    {
      id: 'guess-number',
      title: 'guessNumber.title',
      description: 'guessNumber.description',
      icon: '🔢',
    },
    {
      id: 'catch-animal',
      title: 'catchAnimal.title',
      description: 'catchAnimal.description',
      icon: '🦊',
    },
    {
      id: 'puzzle',
      title: 'puzzle.title',
      description: 'puzzle.description',
      icon: '🧩',
    },
    {
      id: 'where-did-it-go',
      title: 'whereDidIt.title',
      description: 'whereDidIt.description',
      icon: '🔍',
    },
  ]

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-4 md:px-4 md:py-8 lg:py-12">
      <Helmet>
        <title>{t('meta:titles.games')}</title>
        <meta name="description" content={t('meta:descriptions.games')} />
        <meta property="og:title" content={t('meta:titles.games')} />
        <meta
          property="og:description"
          content={t('meta:descriptions.games')}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center md:mb-10 lg:mb-12">
          <h1 className="mb-2 bg-gradient-to-r from-primary-foreground to-purple-600 bg-clip-text text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl px-2 text-xs text-muted-foreground md:text-sm lg:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
          {games.map(game => (
            <Link key={game.id} to={`/games/${game.id}`} className="group">
              <Card className="flex h-full flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="mb-4 text-6xl">{game.icon}</div>
                  <CardTitle className="transition-colors group-hover:text-primary">
                    {t(game.title)}
                  </CardTitle>
                  <CardDescription>{t(game.description)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Games
