import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Grid3X3, Brain, Scissors, Zap, TreePine, Palette } from "lucide-react";
import TicTacToe from "@/games/TicTacToe";
import MemoryCardGame from "@/games/MemoryCardGame";
import RockPaperScissors from "@/games/RockPaperScissors";
import SnakeGame from "@/games/SnakeGame";
import HangmanGame from "@/games/HangmanGame";
import ColoringBook from "@/games/ColoringBook";

const Games = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  useEffect(() => {
    document.title = `${t('layout.appName')} - ${t('games.title')}`;
  }, [t]);

  return (
    <div className="py-12 px-4 min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-nightsky-DEFAULT dark:via-nightsky-light dark:to-nightsky">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bubbly mb-4 bg-gradient-to-r from-dream-DEFAULT via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('games.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('games.subtitle')}
          </p>
        </div>
        
        <Tabs defaultValue="tic-tac-toe" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 dark:bg-nightsky-light/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
            <TabsTrigger value="tic-tac-toe" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-dream-DEFAULT data-[state=active]:to-dream-dark data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tic-Tac-Toe</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brain-DEFAULT data-[state=active]:to-brain-dark data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Memory</span> 
            </TabsTrigger>
            <TabsTrigger value="rock-paper-scissors" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">RPS</span>
            </TabsTrigger>
            <TabsTrigger value="snake" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Snake</span>
            </TabsTrigger>
            <TabsTrigger value="hangman" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <TreePine className="w-4 h-4" />
              <span className="hidden sm:inline">Hangman</span>
            </TabsTrigger>
            <TabsTrigger value="coloring" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl transition-all duration-300">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Coloring</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tic-tac-toe" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <TicTacToe />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="memory" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <MemoryCardGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rock-paper-scissors" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <RockPaperScissors />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="snake" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <SnakeGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hangman" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <HangmanGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="coloring" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <ColoringBook />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Games;
