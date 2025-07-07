
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const SnakeGame = () => {
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Snake Game</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Use arrow keys to control the snake and eat the food!
            </p>
            
            {highScore > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="text-gray-600 dark:text-gray-300 text-sm">High Score</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{highScore}</div>
              </div>
            )}

            <Button 
              onClick={resetGame}
              className="px-8 py-3 text-lg"
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Game Over!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Final Score: {score}</p>
            {score === highScore && score > 0 && (
              <p className="text-blue-600 dark:text-blue-400 mb-6 font-semibold">🎉 New High Score!</p>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="text-gray-600 dark:text-gray-300 text-sm">High Score</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{highScore}</div>
            </div>

            <Button 
              onClick={resetGame}
              className="px-8 py-3 text-lg"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Game Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            Score: {score}
          </div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            High Score: {highScore}
          </div>
        </div>

        {/* Game Board */}
        <div className="relative bg-gray-900 p-4">
          <div 
            className="w-full aspect-square max-w-md mx-auto bg-gray-800 grid gap-0"
            style={{
              gridTemplate: `repeat(${gridSize}, 1fr) / repeat(${gridSize}, 1fr)`
            }}
          >
            {/* Food */}
            <div
              className="bg-red-500"
              style={{
                gridArea: `${food.y} / ${food.x}`
              }}
            />
            
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className="bg-blue-400"
                style={{
                  gridArea: `${segment.y} / ${segment.x}`
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden bg-gray-50 dark:bg-gray-700 grid grid-cols-4">
          <button
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            className="p-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="p-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center"
          >
            <ArrowUp size={20} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            className="p-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center"
          >
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            className="p-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center"
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {!gameStarted && gameState === 'playing' ? 
              'Press an arrow key to start!' : 
              'Use arrow keys to control the snake'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
