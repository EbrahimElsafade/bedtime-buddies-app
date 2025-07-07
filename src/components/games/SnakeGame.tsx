
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SnakeGame = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const gridSize = 20;
  const gameSpeed = 150;

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  }, [gridSize]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
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
      toast.success(`New High Score: ${score}!`);
    } else {
      toast.error(`Game Over! Score: ${score}`);
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
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
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
        setScore(prev => prev + 10);
        setFood(generateFood());
        toast.success('Yummy! +10 points');
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle arrow keys when the game is playing
      if (gameState !== 'playing') return;

      // Prevent default behavior to stop page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      let newDirection = { x: 0, y: 0 };
      let validMove = false;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) {
            newDirection = { x: 0, y: -1 };
            validMove = true;
          }
          break;
        case 'ArrowDown':
          if (direction.y === 0) {
            newDirection = { x: 0, y: 1 };
            validMove = true;
          }
          break;
        case 'ArrowLeft':
          if (direction.x === 0) {
            newDirection = { x: -1, y: 0 };
            validMove = true;
          }
          break;
        case 'ArrowRight':
          if (direction.x === 0) {
            newDirection = { x: 1, y: 0 };
            validMove = true;
          }
          break;
      }

      if (validMove) {
        setDirection(newDirection);
        if (!gameStarted) {
          setGameStarted(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState, gameStarted]);

  if (gameState === 'menu') {
    return (
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            🐍 Snake Game
          </CardTitle>
          <CardDescription>Control the snake to eat food and grow longer!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🐍</div>
              <h3 className="text-xl font-semibold">Classic Snake Game</h3>
              <p className="text-muted-foreground max-w-md">
                Use arrow keys to control the snake. Eat the red food to grow and earn points. 
                Don't hit the walls or yourself!
              </p>
            </div>
            
            {highScore > 0 && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 px-6 py-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">High Score</div>
                  <div className="text-3xl font-bold text-yellow-600">{highScore}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg">
                <div className="text-2xl mb-2">⬆️⬇️⬅️➡️</div>
                <div className="text-sm font-medium">Arrow Keys</div>
                <div className="text-xs text-muted-foreground">Move Snake</div>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 p-4 rounded-lg">
                <div className="text-2xl mb-2">🍎</div>
                <div className="text-sm font-medium">Eat Food</div>
                <div className="text-xs text-muted-foreground">Grow & Score</div>
              </div>
            </div>

            <Button 
              onClick={resetGame}
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              🎮 Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          🐍 Snake Game
        </CardTitle>
        <CardDescription>
          {!gameStarted ? 'Press an arrow key to start!' : 'Use arrow keys to control the snake!'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center space-x-8">
            <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{highScore}</div>
              <div className="text-sm text-muted-foreground">High Score</div>
            </div>
            <div className="text-center bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{snake.length}</div>
              <div className="text-sm text-muted-foreground">Length</div>
            </div>
          </div>

          {gameState === 'gameOver' && (
            <div className="text-center">
              <div className="text-4xl mb-2">😔</div>
              <div className="text-2xl font-bold text-red-600 animate-pulse mb-2">
                Game Over!
              </div>
              <div className="text-muted-foreground">
                Final Score: {score}
                {score === highScore && score > 0 && (
                  <span className="block text-yellow-600 font-semibold">🎉 New High Score! 🎉</span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div 
              className="grid border-4 border-gray-800 dark:border-gray-200 rounded-lg overflow-hidden bg-green-100 dark:bg-green-900"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: '400px',
                height: '400px'
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const x = index % gridSize;
                const y = Math.floor(index / gridSize);
                
                const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
                const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                
                return (
                  <div
                    key={index}
                    className={`
                      border border-green-200 dark:border-green-700 flex items-center justify-center text-xs
                      ${isSnakeHead ? 'bg-green-600 text-white' : ''}
                      ${isSnakeBody ? 'bg-green-500' : ''}
                      ${isFood ? 'bg-red-500' : ''}
                    `}
                  >
                    {isSnakeHead && '🐍'}
                    {isFood && '🍎'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {gameState === 'playing' && (
          <Button 
            onClick={() => setGameState('menu')} 
            variant="outline" 
            className="flex-1"
          >
            Back to Menu
          </Button>
        )}
        <Button 
          onClick={resetGame} 
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {gameState === 'gameOver' ? 'Play Again' : 'New Game'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SnakeGame;
