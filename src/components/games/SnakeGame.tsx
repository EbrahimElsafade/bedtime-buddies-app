
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-700 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-slate-200 mb-4">Snake Game</h1>
            <p className="text-slate-400 mb-8">Use arrow keys to control the snake</p>
            
            {highScore > 0 && (
              <div className="bg-slate-600 rounded-lg p-4 mb-8">
                <div className="text-slate-300 text-sm">High Score</div>
                <div className="text-2xl font-bold text-blue-400">{highScore}</div>
              </div>
            )}

            <Button 
              onClick={resetGame}
              className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Game Details */}
        <div className="flex justify-between items-center p-6 text-slate-300 font-medium text-lg">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
        </div>

        {/* Game Board */}
        <div 
          className="w-full h-96 md:h-[500px] bg-slate-800 relative"
          style={{
            display: 'grid',
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
              className="bg-cyan-400"
              style={{
                gridArea: `${segment.y} / ${segment.x}`
              }}
            />
          ))}
        </div>

        {/* Game Over Message */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-700 p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Game Over!</h2>
              <p className="text-slate-300 mb-6">Final Score: {score}</p>
              <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                Play Again
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        <div className="md:hidden grid grid-cols-4 border-t border-slate-600">
          <button
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            className="p-4 text-slate-300 hover:bg-slate-600 border-r border-slate-600 flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="p-4 text-slate-300 hover:bg-slate-600 border-r border-slate-600 flex items-center justify-center"
          >
            <ArrowUp size={20} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            className="p-4 text-slate-300 hover:bg-slate-600 border-r border-slate-600 flex items-center justify-center"
          >
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            className="p-4 text-slate-300 hover:bg-slate-600 flex items-center justify-center"
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 text-center text-slate-400 text-sm">
          {!gameStarted && gameState === 'playing' ? 
            'Press an arrow key to start!' : 
            'Use arrow keys to control the snake'
          }
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
