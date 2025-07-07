
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Diamond, Heart, Star, Circle, Square, Triangle, Hexagon, Crown } from "lucide-react";

const MemoryCardGame = () => {
  const [cards, setCards] = useState<Array<{id: number, icon: any, color: string, isFlipped: boolean, isMatched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const cardIcons = [
    { icon: Diamond, color: 'text-purple-500' },
    { icon: Heart, color: 'text-red-500' },
    { icon: Star, color: 'text-yellow-500' },
    { icon: Circle, color: 'text-blue-500' },
    { icon: Square, color: 'text-green-500' },
    { icon: Triangle, color: 'text-orange-500' },
    { icon: Hexagon, color: 'text-indigo-500' },
    { icon: Crown, color: 'text-pink-500' }
  ];

  const initializeGame = () => {
    const gameCards = [];
    for (let i = 0; i < cardIcons.length; i++) {
      gameCards.push({
        id: i * 2,
        icon: cardIcons[i].icon,
        color: cardIcons[i].color,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: i * 2 + 1,
        icon: cardIcons[i].icon,
        color: cardIcons[i].color,
        isFlipped: false,
        isMatched: false
      });
    }
    
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStatus('playing');
    setTimeElapsed(0);
    setGameStarted(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameStatus]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2 || gameStatus !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);
      
      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              (c.id === firstCardId || c.id === secondCardId) 
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedCards([]);
          setMatchedPairs(prev => {
            const newMatchedPairs = prev + 1;
            if (newMatchedPairs === cardIcons.length) {
              setGameStatus('won');
              toast.success(`Congratulations! You won in ${moves + 1} moves and ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`);
            }
            return newMatchedPairs;
          });
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              (c.id === firstCardId || c.id === secondCardId) 
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">
            Memory Card Game
          </CardTitle>
          <CardDescription>Match all the pairs of cards to win!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">Test Your Memory!</h3>
              <p className="text-muted-foreground mb-6">
                Click on cards to flip them and find matching pairs. Try to complete the game in as few moves as possible!
              </p>
            </div>
            <Button 
              onClick={initializeGame}
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-dark hover:to-purple-700"
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">
          Memory Card Game
        </CardTitle>
        <CardDescription>Match all the pairs to win!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center space-x-8">
            <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </div>
            <div className="text-center bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{matchedPairs}/{cardIcons.length}</div>
              <div className="text-sm text-muted-foreground">Pairs</div>
            </div>
            <div className="text-center bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>

          {gameStatus === 'won' && (
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-green-600 animate-pulse mb-2">
                Congratulations!
              </div>
              <div className="text-muted-foreground">
                You completed the game in {moves} moves and {formatTime(timeElapsed)}!
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {cards.map((card) => {
              const IconComponent = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || card.isFlipped || gameStatus !== 'playing'}
                  className={`
                    relative w-20 h-20 rounded-lg border-2 transition-all duration-300 transform hover:scale-105
                    ${card.isMatched 
                      ? 'bg-green-100 dark:bg-green-900 border-green-400 opacity-75' 
                      : card.isFlipped 
                        ? 'bg-white dark:bg-nightsky-light border-dream-light shadow-lg' 
                        : 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-500 hover:from-purple-500 hover:to-purple-700'
                    }
                    ${gameStatus !== 'playing' ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {card.isFlipped || card.isMatched ? (
                    <IconComponent className={`w-8 h-8 mx-auto ${card.color}`} />
                  ) : (
                    <div className="text-2xl">❓</div>
                  )}
                  
                  {card.isMatched && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <div className="text-green-600 text-xl">✓</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={initializeGame} 
          className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-dark hover:to-purple-700 transition-all duration-300"
        >
          New Game
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MemoryCardGame;
