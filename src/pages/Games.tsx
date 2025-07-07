
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
  const { t } = useTranslation();
  
  useEffect(() => {
    document.title = `${t('layout.appName')} - ${t('games.title')}`;
  }, [t]);

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">{t('games.title')}</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {t('games.subtitle')}
        </p>
        
        <Tabs defaultValue="tic-tac-toe" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="tic-tac-toe">Tic Tac Toe</TabsTrigger>
            <TabsTrigger value="rock-paper-scissors">Rock Paper Scissors</TabsTrigger>
            <TabsTrigger value="hangman">Hangman</TabsTrigger>
            <TabsTrigger value="memory">Memory Cards</TabsTrigger>
            <TabsTrigger value="snake">Snake</TabsTrigger>
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
