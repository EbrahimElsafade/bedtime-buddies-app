
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import TicTacToeGame from "@/components/games/TicTacToeGame";
import RockPaperScissorsGame from "@/components/games/RockPaperScissorsGame";
import HangmanGame from "@/components/games/HangmanGame";
import MemoryCardGame from "@/components/games/MemoryCardGame";
import SnakeGame from "@/components/games/SnakeGame";

const Games = () => {
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation(['common', 'navigation']);
  
  useEffect(() => {
    document.title = `${t('layout.appName', { ns: 'common' })} - ${t('games', { ns: 'navigation' })}`;
  }, [t]);

  const isRTL = i18n.language === 'ar';

  return (
    <div className="py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">{t('games.title', { ns: 'common' })}</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {t('games.subtitle', { ns: 'common' })}
        </p>
        
        <Tabs defaultValue="tic-tac-toe" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="tic-tac-toe">{t('games.ticTacToe.title', { ns: 'common' })}</TabsTrigger>
            <TabsTrigger value="rock-paper-scissors">Rock Paper Scissors</TabsTrigger>
            <TabsTrigger value="hangman">Hangman</TabsTrigger>
            <TabsTrigger value="memory">Memory Cards</TabsTrigger>
            <TabsTrigger value="snake">{t('games.snake.title', { ns: 'common' })}</TabsTrigger>
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
