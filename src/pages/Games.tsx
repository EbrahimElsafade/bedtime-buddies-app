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
  const { isAuthenticated } = useAuth()
  const { t, i18n } = useTranslation(['games', 'common', 'navigation'])
  const isMobile = useIsMobile()

  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t('games', { ns: 'navigation' })}`
  }, [t])

  const isRTL = i18n.language === 'ar'

  return (
    <div
      className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-4 md:px-4 md:py-8 lg:py-12"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-primary-foreground to-purple-600 bg-clip-text text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('title', { ns: 'games' })}
          </h1>
          <p className="mx-auto max-w-2xl px-2 text-xs text-muted-foreground md:text-sm lg:text-base">
            {t('subtitle', { ns: 'games' })}
          </p>
        </div>

        <Tabs
          defaultValue="tic-tac-toe"
          className="w-full"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <TabsList
            className={`${
              isMobile
                ? 'grid h-auto grid-cols-2 gap-1 p-1 sm:grid-cols-3 lg:grid-cols-5'
                : 'grid h-12 grid-cols-5 p-1'
            } mb-4 w-full overflow-hidden rounded-lg bg-transparent shadow-none md:mb-6 lg:mb-8`}
          >
            <TabsTrigger
              value="tic-tac-toe"
              className={`${
                isMobile
                  ? 'h-auto whitespace-normal break-words px-1 py-2 text-center text-[10px] sm:px-2 sm:text-xs'
                  : 'px-3 py-2 text-sm'
              } rounded-md font-medium transition-all bg-primary border-none ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL
                ? 'إكس أو'
                : isMobile
                  ? 'Tic Tac'
                  : t('ticTacToe.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger
              value="rock-paper-scissors"
              className={`${
                isMobile
                  ? 'h-auto whitespace-normal break-words px-1 py-2 text-center text-[10px] sm:px-2 sm:text-xs'
                  : 'px-3 py-2 text-sm'
              } rounded-md font-medium transition-all bg-primary border-none ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL
                ? 'حجر ورقة'
                : isMobile
                  ? 'RPS'
                  : t('rockPaperScissors.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger
              value="hangman"
              className={`${
                isMobile
                  ? 'h-auto whitespace-normal break-words px-1 py-2 text-center text-[10px] sm:px-2 sm:text-xs'
                  : 'px-3 py-2 text-sm'
              } rounded-md font-medium transition-all bg-primary border-none ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL
                ? 'كلمات'
                : t('hangman.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger
              value="memory"
              className={`${
                isMobile
                  ? 'h-auto whitespace-normal px-1 py-2 text-center text-[10px] sm:px-2 sm:text-xs'
                  : 'px-3 py-2 text-sm'
              } rounded-md font-medium transition-all bg-primary border-none ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'ذاكرة' : t('memory.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger
              value="snake"
              className={`${
                isMobile
                  ? 'col-span-2 h-auto whitespace-normal px-1 py-2 text-center text-[10px] sm:col-span-1 sm:px-2 sm:text-xs'
                  : 'px-3 py-2 text-sm'
              } rounded-md font-medium transition-all bg-primary border-none ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'ثعبان' : t('snake.title', { ns: 'games' })}
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
              value="rock-paper-scissors"
              className="mt-0 focus-visible:outline-none"
            >
              <RockPaperScissorsGame />
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
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default Games
