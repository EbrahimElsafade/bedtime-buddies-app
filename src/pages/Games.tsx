import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '@/hooks/use-mobile'
import TicTacToeGame from '@/components/games/TicTacToeGame'
import RockPaperScissorsGame from '@/components/games/RockPaperScissorsGame'
import HangmanGame from '@/components/games/HangmanGame'
import MemoryCardGame from '@/components/games/MemoryCardGame'
import SnakeGame from '@/components/games/SnakeGame'

const Games = () => {
  const { t } = useTranslation(['games', 'common', 'navigation'])

  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t('games', { ns: 'navigation' })}`
  }, [t])

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-4 md:px-4 md:py-8 lg:py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-primary-foreground to-purple-600 bg-clip-text text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl px-2 text-xs text-muted-foreground md:text-sm lg:text-base">
            {t('subtitle')}
          </p>
        </div>

        <Tabs defaultValue="tic-tac-toe" className="w-full">
          <TabsList className="mb-4 md:mb-6 lg:mb-8">
            <TabsTrigger value="tic-tac-toe">
              {t('ticTacToe.title')}
            </TabsTrigger>
            <TabsTrigger value="hangman">{t('hangman.title')}</TabsTrigger>
            <TabsTrigger value="memory">{t('memory.title')}</TabsTrigger>
            <TabsTrigger value="snake">{t('snake.title')}</TabsTrigger>
            <TabsTrigger value="rock-paper-scissors" className="min-w-fit">
              {t('rockPaperScissors.title')}
            </TabsTrigger>
          </TabsList>

          <div className="mx-auto w-full max-w-4xl">
            <TabsContent
              value="tic-tac-toe"
              className="mt-0 focus-visible:outline-none"
            >
              <TicTacToeGame />
            </TabsContent>

            <TabsContent
              value="hangman"
              className="mt-0 focus-visible:outline-none"
            >
              <HangmanGame />
            </TabsContent>

            <TabsContent
              value="memory"
              className="mt-0 focus-visible:outline-none"
            >
              <MemoryCardGame />
            </TabsContent>

            <TabsContent
              value="snake"
              className="mt-0 focus-visible:outline-none"
            >
              <SnakeGame />
            </TabsContent>

            <TabsContent
              value="rock-paper-scissors"
              className="mt-0 focus-visible:outline-none"
            >
              <RockPaperScissorsGame />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default Games
