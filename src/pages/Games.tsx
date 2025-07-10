
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import TicTacToeGame from "@/components/games/TicTacToeGame";
import RockPaperScissorsGame from "@/components/games/RockPaperScissorsGame";
import HangmanGame from "@/components/games/HangmanGame";
import MemoryCardGame from "@/components/games/MemoryCardGame";
import SnakeGame from "@/components/games/SnakeGame";

const Games = () => {
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation(['common', 'navigation']);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t('games', { ns: 'navigation' })}`;
  }, [t]);

  const isRTL = i18n.language === 'ar';

  return (
    <div className="py-6 md:py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent mb-2 md:mb-4">
            {t('games.title', { ns: 'common' })}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {t('games.subtitle', { ns: 'common' })}
          </p>
        </div>

        <Tabs defaultValue="tic-tac-toe" className="w-full">
          <TabsList className={`${
            isMobile 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1' 
              : 'grid grid-cols-5 h-10 p-1'
          } w-full mb-6 md:mb-8 bg-muted`}>
            <TabsTrigger 
              value="tic-tac-toe" 
              className={`${
                isMobile 
                  ? 'text-xs px-2 py-2 h-auto whitespace-normal text-center' 
                  : 'px-3 py-1.5'
              } rounded-sm transition-all`}
            >
              {isMobile ? t('games.ticTacToe.title', { ns: 'common' }).split(' ')[0] : t('games.ticTacToe.title', { ns: 'common' })}
            </TabsTrigger>
            <TabsTrigger 
              value="rock-paper-scissors"
              className={`${
                isMobile 
                  ? 'text-xs px-2 py-2 h-auto whitespace-normal text-center' 
                  : 'px-3 py-1.5'
              } rounded-sm transition-all`}
            >
              {isMobile ? 'RPS' : t('games.rockPaperScissors.title', { ns: 'common' })}
            </TabsTrigger>
            <TabsTrigger 
              value="hangman"
              className={`${
                isMobile 
                  ? 'text-xs px-2 py-2 h-auto whitespace-normal text-center' 
                  : 'px-3 py-1.5'
              } rounded-sm transition-all`}
            >
              {t('games.hangman.title', { ns: 'common' })}
            </TabsTrigger>
            <TabsTrigger 
              value="memory"
              className={`${
                isMobile 
                  ? 'text-xs px-2 py-2 h-auto whitespace-normal text-center col-span-1 md:col-span-1' 
                  : 'px-3 py-1.5'
              } rounded-sm transition-all`}
            >
              {t('games.memory.title', { ns: 'common' })}
            </TabsTrigger>
            <TabsTrigger 
              value="snake"
              className={`${
                isMobile 
                  ? 'text-xs px-2 py-2 h-auto whitespace-normal text-center col-span-1 md:col-span-1' 
                  : 'px-3 py-1.5'
              } rounded-sm transition-all`}
            >
              {t('games.snake.title', { ns: 'common' })}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tic-tac-toe" className="mt-0">
            <TicTacToeGame />
          </TabsContent>
          
          <TabsContent value="rock-paper-scissors" className="mt-0">
            <RockPaperScissorsGame />
          </TabsContent>
          
          <TabsContent value="hangman" className="mt-0">
            <HangmanGame />
          </TabsContent>
          
          <TabsContent value="memory" className="mt-0">
            <MemoryCardGame />
          </TabsContent>
          
          <TabsContent value="snake" className="mt-0">
            <SnakeGame />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Games;
