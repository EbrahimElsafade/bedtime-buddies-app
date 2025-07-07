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

  // Array of fruit emojis for variety
  const fruits = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭'];
  const [currentFruit, setCurrentFruit] = useState('🍎');

  const generateFood = useCallback(() => {
    // Pick a random fruit
    setCurrentFruit(fruits[Math.floor(Math.random() * fruits.length)]);
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
        // Removed toast notification here
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
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Snake Game
          </CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            Control the snake to eat delicious fruits and grow longer!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-6">
              <div className="text-8xl mb-6 animate-bounce">🐍</div>
              <h3 className="text-2xl font-semibold text-cyan-300">Classic Snake Adventure</h3>
              <p className="text-slate-300 max-w-md leading-relaxed">
                Use arrow keys to guide your snake around the board. Eat colorful fruits to grow bigger and earn points! 
                Watch out for walls and don't bite yourself!
              </p>
            </div>
            
            {highScore > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-8 py-6 rounded-2xl">
                <div className="text-center">
                  <div className="text-sm font-medium text-yellow-300 mb-1">🏆 High Score</div>
                  <div className="text-4xl font-bold text-yellow-400">{highScore}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 text-center max-w-md">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 p-6 rounded-2xl">
                <div className="text-3xl mb-3">⬆️⬇️⬅️➡️</div>
                <div className="text-sm font-medium text-blue-300">Arrow Keys</div>
                <div className="text-xs text-slate-400 mt-1">Move Snake</div>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 p-6 rounded-2xl">
                <div className="text-3xl mb-3">{fruits.join('')}</div>
                <div className="text-sm font-medium text-red-300">Eat Fruits</div>
                <div className="text-xs text-slate-400 mt-1">Grow & Score</div>
              </div>
            </div>

            <Button 
              onClick={resetGame}
              className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              🎮 Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Snake Game
        </CardTitle>
        <CardDescription className="text-slate-300 text-lg">
          {!gameStarted ? 'Press an arrow key to start!' : 'Use arrow keys to control the snake!'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex justify-center space-x-6">
            <div className="text-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 px-6 py-4 rounded-2xl">
              <div className="text-3xl font-bold text-blue-400">{score}</div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
            <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 px-6 py-4 rounded-2xl">
              <div className="text-3xl font-bold text-yellow-400">{highScore}</div>
              <div className="text-sm text-slate-400">Best</div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-sm border border-green-500/30 px-6 py-4 rounded-2xl">
              <div className="text-3xl font-bold text-green-400">{snake.length}</div>
              <div className="text-sm text-slate-400">Length</div>
            </div>
          </div>

          {gameState === 'gameOver' && (
            <div className="text-center bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 p-8 rounded-2xl">
              <div className="text-6xl mb-4 animate-pulse">💔</div>
              <div className="text-3xl font-bold text-red-400 mb-4">
                Game Over!
              </div>
              <div className="text-slate-300 text-lg">
                Final Score: <span className="text-white font-bold">{score}</span>
                {score === highScore && score > 0 && (
                  <div className="text-yellow-400 font-semibold mt-2">🎉 New High Score! 🎉</div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div 
              className="grid relative rounded-3xl overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: '480px',
                height: '480px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
                backgroundSize: '20px 20px',
                boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.8), 0 0 50px rgba(59, 130, 246, 0.3)',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {/* Smoky overlay effect */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                  animation: 'pulse 4s ease-in-out infinite alternate'
                }}
              />
              
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
                      flex items-center justify-center text-lg transition-all duration-300 relative
                      ${isFood ? 'animate-bounce' : ''}
                    `}
                    style={{
                      background: isFood 
                        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
                        : 'transparent'
                    }}
                  >
                    {isSnakeHead && (
                      <div 
                        className="text-2xl relative z-10"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
                          textShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                        }}
                      >
                        🐍
                      </div>
                    )}
                    {isSnakeBody && (
                      <div 
                        className="text-xl relative z-10"
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))',
                          textShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
                        }}
                      >
                        🟢
                      </div>
                    )}
                    {isFood && (
                      <div 
                        className="text-2xl relative z-10"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
                          animation: 'bounce 1s ease-in-out infinite'
                        }}
                      >
                        {currentFruit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-4 pt-6">
        {gameState === 'playing' && (
          <Button 
            onClick={() => setGameState('menu')} 
            variant="outline" 
            className="flex-1 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl"
          >
            Back to Menu
          </Button>
        )}
        <Button 
          onClick={resetGame} 
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 rounded-xl shadow-lg"
        >
          {gameState === 'gameOver' ? '🔄 Play Again' : '🆕 New Game'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SnakeGame;
