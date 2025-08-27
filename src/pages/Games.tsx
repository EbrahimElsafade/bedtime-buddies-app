
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
  const { t, i18n } = useTranslation(['games', 'common', 'navigation']);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t('games', { ns: 'navigation' })}`;
  }, [t]);

  const isRTL = i18n.language === 'ar';

  return (
    <div className="py-4 md:py-8 lg:py-12 px-3 md:px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 md:mb-6 lg:mb-8 text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text   mb-2 md:mb-3 lg:mb-4 leading-tight">
            {t('title', { ns: 'games' })}
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t('subtitle', { ns: 'games' })}
          </p>
        </div>

        <Tabs defaultValue="tic-tac-toe" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className={`${
            isMobile 
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1' 
              : 'grid grid-cols-5 h-11 p-1'
          } w-full mb-4 md:mb-6 lg:mb-8 bg-muted rounded-lg overflow-hidden`}>
            <TabsTrigger 
              value="tic-tac-toe" 
              className={`${
                isMobile 
                  ? 'text-[10px] sm:text-xs px-1 sm:px-2 py-2 h-auto whitespace-normal text-center break-words' 
                  : 'px-3 py-2 text-sm'
              } rounded-md transition-all font-medium ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'إكس أو' : isMobile ? 'Tic Tac' : t('ticTacToe.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger 
              value="rock-paper-scissors"
              className={`${
                isMobile 
                  ? 'text-[10px] sm:text-xs px-1 sm:px-2 py-2 h-auto whitespace-normal text-center break-words' 
                  : 'px-3 py-2 text-sm'
              } rounded-md transition-all font-medium ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'حجر ورقة' : isMobile ? 'RPS' : t('rockPaperScissors.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger 
              value="hangman"
              className={`${
                isMobile 
                  ? 'text-[10px] sm:text-xs px-1 sm:px-2 py-2 h-auto whitespace-normal text-center break-words' 
                  : 'px-3 py-2 text-sm'
              } rounded-md transition-all font-medium ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'كلمات' : t('hangman.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger 
              value="memory"
              className={`${
                isMobile 
                  ? 'text-[10px] sm:text-xs px-1 sm:px-2 py-2 h-auto whitespace-normal text-center' 
                  : 'px-3 py-2 text-sm'
              } rounded-md transition-all font-medium ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'ذاكرة' : t('memory.title', { ns: 'games' })}
            </TabsTrigger>
            <TabsTrigger 
              value="snake"
              className={`${
                isMobile 
                  ? 'text-[10px] sm:text-xs px-1 sm:px-2 py-2 h-auto whitespace-normal text-center col-span-2 sm:col-span-1' 
                  : 'px-3 py-2 text-sm'
              } rounded-md transition-all font-medium ${isRTL ? 'font-arabic' : ''}`}
            >
              {isMobile && isRTL ? 'ثعبان' : t('snake.title', { ns: 'games' })}
            </TabsTrigger>
          </TabsList>
          
          <div className="w-full max-w-4xl mx-auto">
            <TabsContent value="tic-tac-toe" className="mt-0 focus-visible:outline-none">
              <TicTacToeGame />
            </TabsContent>
            
            <TabsContent value="rock-paper-scissors" className="mt-0 focus-visible:outline-none">
              <RockPaperScissorsGame />
            </TabsContent>
            
            <TabsContent value="hangman" className="mt-0 focus-visible:outline-none">
              <HangmanGame />
            </TabsContent>
            
            <TabsContent value="memory" className="mt-0 focus-visible:outline-none">
              <MemoryCardGame />
            </TabsContent>
            
            <TabsContent value="snake" className="mt-0 focus-visible:outline-none">
              <SnakeGame />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Games;
