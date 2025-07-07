
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star, Heart } from 'lucide-react';

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
        <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Fun background decorations */}
          <div className="absolute top-4 left-4 text-yellow-300 animate-bounce">
            <Star size={24} />
          </div>
          <div className="absolute top-4 right-4 text-pink-300 animate-pulse">
            <Heart size={24} />
          </div>
          <div className="absolute bottom-4 left-8 text-blue-300 animate-bounce delay-300">
            <Star size={20} />
          </div>
          <div className="absolute bottom-4 right-8 text-green-300 animate-pulse delay-500">
            <Heart size={20} />
          </div>
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bubbly text-white mb-4 drop-shadow-lg">
              🐍 Snake Adventure! 🍎
            </h2>
            <p className="text-white/90 text-lg mb-6 font-rounded drop-shadow">
              Help our friendly snake eat yummy apples!
            </p>
            
            {highScore > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30">
                <div className="text-white/80 text-lg font-rounded">🏆 Best Score</div>
                <div className="text-3xl font-bold text-white drop-shadow-lg">{highScore}</div>
              </div>
            )}

            <Button 
              onClick={resetGame}
              className="px-8 py-4 text-xl font-bubbly bg-white text-purple-600 hover:bg-yellow-100 hover:text-purple-700 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🎮 Start Playing!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-red-400 via-pink-400 to-purple-400 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Fun background decorations */}
          <div className="absolute top-4 left-4 text-yellow-300 animate-spin">
            <Star size={24} />
          </div>
          <div className="absolute top-4 right-4 text-pink-300 animate-bounce">
            <Heart size={24} />
          </div>
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bubbly text-white mb-4 drop-shadow-lg">
              😵 Oops! Game Over! 
            </h2>
            <p className="text-white text-2xl mb-4 font-rounded drop-shadow">
              🎯 Final Score: {score}
            </p>
            {score === highScore && score > 0 && (
              <p className="text-yellow-200 mb-6 font-bold text-xl animate-bounce">
                🎉 New High Score! Amazing! 🎉
              </p>
            )}
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/30">
              <div className="text-white/80 text-lg font-rounded">🏆 Best Score</div>
              <div className="text-3xl font-bold text-white drop-shadow-lg">{highScore}</div>
            </div>

            <Button 
              onClick={resetGame}
              className="px-8 py-4 text-xl font-bubbly bg-white text-purple-600 hover:bg-yellow-100 hover:text-purple-700 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🔄 Play Again!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-3xl shadow-2xl overflow-hidden">
        {/* Game Header */}
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-white/20">
          <div className="text-xl font-bubbly text-white drop-shadow">
            🎯 Score: <span className="text-yellow-200">{score}</span>
          </div>
          <div className="text-xl font-bubbly text-white drop-shadow">
            🏆 Best: <span className="text-yellow-200">{highScore}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative p-6">
          <div 
            className="w-full aspect-square max-w-md mx-auto bg-gradient-to-br from-green-200 to-green-300 rounded-2xl shadow-inner grid gap-0 border-4 border-white/30"
            style={{
              gridTemplate: `repeat(${gridSize}, 1fr) / repeat(${gridSize}, 1fr)`
            }}
          >
            {/* Food */}
            <div
              className="bg-red-500 rounded-full shadow-lg relative overflow-hidden"
              style={{
                gridArea: `${food.y} / ${food.x}`,
                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs">
                🍎
              </div>
            </div>
            
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`rounded-full shadow-lg ${
                  index === 0 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-blue-400 to-blue-500'
                }`}
                style={{
                  gridArea: `${segment.y} / ${segment.x}`
                }}
              >
                {index === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-xs">
                    😊
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden bg-white/10 backdrop-blur-sm grid grid-cols-4 border-t border-white/20">
          <button
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            className="p-4 text-white hover:bg-white/20 transition-colors flex items-center justify-center border-r border-white/20"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            className="p-4 text-white hover:bg-white/20 transition-colors flex items-center justify-center border-r border-white/20"
          >
            <ArrowUp size={24} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            className="p-4 text-white hover:bg-white/20 transition-colors flex items-center justify-center border-r border-white/20"
          >
            <ArrowRight size={24} />
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            className="p-4 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <ArrowDown size={24} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 text-center border-t border-white/20">
          <p className="text-white text-lg font-rounded drop-shadow">
            {!gameStarted && gameState === 'playing' ? 
              '🎮 Press an arrow key to start your adventure!' : 
              '⌨️ Use arrow keys to help the snake find food!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
