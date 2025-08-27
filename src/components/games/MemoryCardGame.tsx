
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Diamond, Heart, Star, Circle, Square, Triangle, Hexagon, Crown } from "lucide-react";
import { useTranslation } from 'react-i18next';

const MemoryCardGame = () => {
  const { t } = useTranslation('games');
  type IconComponent = React.ComponentType<{ className?: string }>
  const [cards, setCards] = useState<Array<{id: number, icon: IconComponent, color: string, isFlipped: boolean, isMatched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const cardIcons: Array<{ icon: IconComponent, color: string }> = [
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
              toast.success(t('games.memory.gameCompleted', { moves: moves + 1 }));
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
      <div className="w-full max-w-2xl mx-auto px-2">
        <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
          <CardHeader className="text-center px-4 py-6">
            <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text  ">
              {t('memory.title')}
            </CardTitle>
            <CardDescription className="text-sm md:text-base">{t('memory.description')}</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col items-center space-y-4 md:space-y-6">
              <div className="text-center">
                <div className="text-4xl md:text-6xl mb-4">🧠</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{t('memory.testYourMemory')}</h3>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base px-2">
                  {t('memory.clickToFlip')}
                </p>
              </div>
              <Button 
                onClick={initializeGame}
                className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-dark hover:to-purple-700 w-full max-w-xs"
              >
                {t('memory.startGame')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader className="text-center px-4 py-4">
          <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text  ">
            {t('memory.title')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">{t('memory.description')}</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 px-3 md:px-6 py-2 md:py-3 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">{moves}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{t('memory.moves')}</div>
              </div>
              <div className="text-center bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 px-3 md:px-6 py-2 md:py-3 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">{matchedPairs}/{cardIcons.length}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Pairs</div>
              </div>
              <div className="text-center bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 px-3 md:px-6 py-2 md:py-3 rounded-lg">
                <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeElapsed)}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            {gameStatus === 'won' && (
              <div className="text-center py-4">
                <div className="text-3xl md:text-4xl mb-2">🎉</div>
                <div className="text-xl md:text-2xl font-bold text-green-600 animate-pulse mb-2">
                  {t('memory.congratulations')}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {t('memory.gameCompleted', { moves })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-sm mx-auto">
              {cards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isMatched || card.isFlipped || gameStatus !== 'playing'}
                    className={`
                      relative w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 transition-all duration-300 transform hover:scale-105
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
                      <IconComponent className={`w-6 h-6 md:w-8 md:h-8 mx-auto ${card.color}`} />
                    ) : (
                      <div className="text-lg md:text-2xl">❓</div>
                    )}
                    
                    {card.isMatched && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <div className="text-green-600 text-lg md:text-xl">✓</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-4">
          <Button 
            onClick={initializeGame} 
            className="w-full py-3 text-base md:text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-dark hover:to-purple-700 transition-all duration-300"
          >
            {t('memory.playAgain')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MemoryCardGame;
