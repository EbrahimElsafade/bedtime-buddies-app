
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TicTacToeGame from "@/components/games/TicTacToeGame";
import SnakeGame from "@/components/games/SnakeGame";
import RockPaperScissorsGame from "@/components/games/RockPaperScissorsGame";
import HangmanGame from "@/components/games/HangmanGame";
import MemoryCardGame from "@/components/games/MemoryCardGame";

const Games = () => {
  const { t } = useTranslation(['common', 'misc']);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: "tic-tac-toe",
      title: t('common:games.ticTacToe.title'),
      description: t('common:games.ticTacToe.description'),
      component: TicTacToeGame,
    },
    {
      id: "snake",
      title: t('common:games.snake.title'),
      description: t('common:games.snake.description'),
      component: SnakeGame,
    },
    {
      id: "rock-paper-scissors",
      title: t('common:games.rockPaperScissors.title'),
      description: t('common:games.rockPaperScissors.description'),
      component: RockPaperScissorsGame,
    },
    {
      id: "hangman",
      title: t('common:games.hangman.title'),
      description: t('common:games.hangman.description'),
      component: HangmanGame,
    },
    {
      id: "memory",
      title: t('common:games.memory.title'),
      description: t('common:games.memory.description'),
      component: MemoryCardGame,
    },
  ];

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedGame(null)}
              className="mb-4"
            >
              ← {t('misc:button.goBack')}
            </Button>
            <h1 className="text-3xl font-bold text-dream-DEFAULT">{game.title}</h1>
          </div>
          <GameComponent />
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-dream-DEFAULT mb-4">
          {t('common:games.title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('common:games.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => setSelectedGame(game.id)}
              >
                {t('misc:button.startLearning')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          {t('misc:games.comingSoon')}
        </p>
      </div>
    </div>
  );
};

export default Games;
