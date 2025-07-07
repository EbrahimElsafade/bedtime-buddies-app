import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SnakeGame = () => {
  const { t, i18n } = useTranslation('common');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const gridSize = 30;
  const gameSpeed = 100;

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * gridSize) + 1,
      y: Math.floor(Math.random() * gridSize) + 1
    };
  }, [gridSize]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 5, y: 5 }]);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameState('playing');
    setGameStarted(false);
  }, [generateFood]);

  const gameOver = useCallback(() => {
    setGameState('gameOver');
    setGameStarted(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing' || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x <= 0 || head.x > gridSize || head.y <= 0 || head.y > gridSize) {
        gameOver();
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameState, gameStarted, gameOver, generateFood, gridSize]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, gameSpeed]);

  const handleDirectionChange = (newDirection: { x: number; y: number }) => {
    if (gameState !== 'playing') return;
    
    // Prevent reverse direction
    if ((newDirection.x === 1 && direction.x === -1) ||
        (newDirection.x === -1 && direction.x === 1) ||
        (newDirection.y === 1 && direction.y === -1) ||
        (newDirection.y === -1 && direction.y === 1)) {
      return;
    }

    setDirection(newDirection);
    if (!gameStarted) {
      setGameStarted(true);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          handleDirectionChange({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          handleDirectionChange({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          handleDirectionChange({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          handleDirectionChange({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState, gameStarted]);

  if (gameState === 'menu') {
    return (
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">
            {t('games.snake.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('games.snake.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {highScore > 0 && (
              <div className="bg-gradient-to-r from-dream-light/20 to-purple-100/20 dark:from-nightsky-light/50 to-nightsky/50 rounded-xl p-6 shadow-lg border border-dream-light/20">
                <div className="text-muted-foreground text-sm mb-1 font-medium">{t('games.snake.highScore')}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">{highScore}</div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={resetGame}
            className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-light hover:to-purple-700 text-white transition-all duration-300 shadow-lg"
          >
            {t('games.snake.startGame')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-500 dark:text-red-400">
            {t('games.snake.gameOver')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('games.snake.score')} {score}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {score === highScore && score > 0 && (
              <div className="text-dream-DEFAULT dark:text-dream-light font-semibold text-lg animate-twinkle">
                🎉 {t('games.snake.newHighScore')}
              </div>
            )}
            
            <div className="bg-gradient-to-r from-dream-light/20 to-purple-100/20 dark:from-nightsky-light/50 to-nightsky/50 rounded-xl p-6 shadow-lg w-full max-w-sm border border-dream-light/20">
              <div className="text-muted-foreground text-sm mb-1 text-center font-medium">{t('games.snake.highScore')}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent text-center">{highScore}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={resetGame}
            className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-light hover:to-purple-700 text-white transition-all duration-300 shadow-lg"
          >
            {t('games.snake.playAgain')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="bg-gradient-to-r from-dream-light/20 to-purple-100/20 dark:from-nightsky-light/50 to-nightsky/50 rounded-lg px-4 py-2 border border-dream-light/20">
            <div className="text-sm text-muted-foreground font-medium">{t('games.snake.score')}</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">{score}</div>
          </div>
          <div className="bg-gradient-to-r from-dream-light/20 to-purple-100/20 dark:from-nightsky-light/50 to-nightsky/50 rounded-lg px-4 py-2 border border-dream-light/20">
            <div className="text-sm text-muted-foreground font-medium">{t('games.snake.highScore')}</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">{highScore}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative bg-gradient-to-br from-nightsky-DEFAULT to-nightsky-light rounded-lg p-4 mb-6 shadow-inner border border-dream-light/20">
          <div 
            className="w-full h-full max-w-[min(70vw,70vh)] max-h-[min(70vw,70vh)] bg-gradient-to-br from-nightsky-light to-nightsky grid gap-0 mx-auto rounded-md shadow-inner"
            style={{
              gridTemplate: `repeat(${gridSize}, 1fr) / repeat(${gridSize}, 1fr)`,
              aspectRatio: '1'
            }}
          >
            {/* Food */}
            <div
              className="bg-gradient-to-br from-red-400 to-red-600 rounded-sm shadow-lg animate-pulse"
              style={{
                gridArea: `${food.y} / ${food.x}`
              }}
            />
            
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`${
                  index === 0 
                    ? 'bg-gradient-to-br from-dream-light to-dream-DEFAULT shadow-lg' 
                    : 'bg-gradient-to-br from-dream-DEFAULT to-purple-600'
                } rounded-sm`}
                style={{
                  gridArea: `${segment.y} / ${segment.x}`
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden grid grid-cols-3 gap-2 max-w-48 mx-auto">
          <div></div>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="p-4 bg-gradient-to-br from-dream-light/30 to-purple-200/30 dark:from-dream-light/20 dark:to-purple-800/20 rounded-lg hover:scale-105 transition-all duration-200 flex items-center justify-center border border-dream-light/20 shadow-lg"
          >
            <ArrowUp size={24} className="text-dream-DEFAULT dark:text-dream-light" />
          </button>
          <div></div>
          
          <button
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            className="p-4 bg-gradient-to-br from-dream-light/30 to-purple-200/30 dark:from-dream-light/20 dark:to-purple-800/20 rounded-lg hover:scale-105 transition-all duration-200 flex items-center justify-center border border-dream-light/20 shadow-lg"
          >
            <ArrowLeft size={24} className="text-dream-DEFAULT dark:text-dream-light" />
          </button>
          <div></div>
          <button
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            className="p-4 bg-gradient-to-br from-dream-light/30 to-purple-200/30 dark:from-dream-light/20 dark:to-purple-800/20 rounded-lg hover:scale-105 transition-all duration-200 flex items-center justify-center border border-dream-light/20 shadow-lg"
          >
            <ArrowRight size={24} className="text-dream-DEFAULT dark:text-dream-light" />
          </button>
          
          <div></div>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            className="p-4 bg-gradient-to-br from-dream-light/30 to-purple-200/30 dark:from-dream-light/20 dark:to-purple-800/20 rounded-lg hover:scale-105 transition-all duration-200 flex items-center justify-center border border-dream-light/20 shadow-lg"
          >
            <ArrowDown size={24} className="text-dream-DEFAULT dark:text-dream-light" />
          </button>
          <div></div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            {!gameStarted && gameState === 'playing' ? 
              'Press an arrow key to start!' : 
              'Use arrow keys to control the snake'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SnakeGame;
