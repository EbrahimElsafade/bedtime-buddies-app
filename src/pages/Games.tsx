import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Grid3X3, Brain, Scissors, Zap, TreePine, Palette } from "lucide-react";

const TicTacToe = () => {
  const { t } = useTranslation();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  
  const calculateWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };
  
  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    
    const newBoard = board.slice();
    newBoard[i] = isXNext ? '✖️' : '⭕';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      toast.success(`${gameWinner} ${t('games.ticTacToe.won')}`);
    } else if (!newBoard.includes(null)) {
      setWinner('draw');
      toast.info(t('games.ticTacToe.draw'));
    }
  };
  
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };
  
  const renderSquare = (i: number) => {
    return (
      <button
        className="w-20 h-20 flex items-center justify-center text-3xl bg-gradient-to-br from-white to-gray-100 dark:from-nightsky-light dark:to-nightsky hover:from-dream-light hover:to-dream-DEFAULT dark:hover:from-dream-dark dark:hover:to-dream-DEFAULT border-2 border-dream-light/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        onClick={() => handleClick(i)}
      >
        {board[i]}
      </button>
    );
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-gradient-to-br from-white/80 to-dream-light/20 dark:from-nightsky-light/80 dark:to-nightsky/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center bg-gradient-to-r from-dream-DEFAULT to-dream-dark text-white">
        <div className="flex items-center justify-center gap-2">
          <Grid3X3 className="w-6 h-6" />
          <CardTitle className="text-2xl font-bold">{t('games.ticTacToe.title')}</CardTitle>
        </div>
        <CardDescription className="text-dream-light">{t('games.ticTacToe.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center">
          <div className="mb-6 text-xl font-bold text-center p-4 bg-gradient-to-r from-moon-light to-moon-DEFAULT rounded-lg shadow-inner">
            {winner 
              ? winner === 'draw' 
                ? t('games.ticTacToe.draw')
                : `🎉 ${t('games.ticTacToe.winner')} ${winner}` 
              : `${t('games.ticTacToe.nextPlayer')} ${isXNext ? '✖️' : '⭕'}`}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-nightsky-light/20 dark:to-nightsky/20 rounded-2xl shadow-inner">
            {Array.from({ length: 9 }, (_, i) => renderSquare(i))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-dream-light to-dream-DEFAULT">
        <Button onClick={resetGame} className="w-full bg-white text-dream-dark hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          {t('games.ticTacToe.newGame')}
        </Button>
      </CardFooter>
    </Card>
  );
};

const MemoryCardGame = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Array<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎵'];

  const initializeGame = () => {
    const shuffledCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isMatched: true, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          );
          
          if (updatedCards.every(card => card.isMatched)) {
            setIsWon(true);
            toast.success(`🎉 Congratulations! You won in ${moves + 1} moves!`);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards, moves]);

  const handleCardClick = (cardId: number) => {
    const card = cards[cardId];
    
    if (card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );
    
    setFlippedCards(prev => [...prev, cardId]);
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-gradient-to-br from-white/80 to-brain-light/20 dark:from-nightsky-light/80 dark:to-nightsky/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center bg-gradient-to-r from-brain-DEFAULT to-brain-dark text-white">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-6 h-6" />
          <CardTitle className="text-2xl font-bold">Memory Challenge</CardTitle>
        </div>
        <CardDescription className="text-brain-light">Test your memory skills!</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center">
          <div className="mb-6 text-xl font-bold text-center p-4 bg-gradient-to-r from-moon-light to-moon-DEFAULT rounded-lg shadow-inner">
            {isWon ? `🎉 You Won in ${moves} moves!` : `Moves: ${moves}`}
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-nightsky-light/20 dark:to-nightsky/20 rounded-2xl shadow-inner">
            {cards.map((card) => (
              <button
                key={card.id}
                className={`w-16 h-16 flex items-center justify-center text-2xl rounded-xl transition-all duration-500 transform border-2 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-white to-moon-light shadow-lg scale-105 border-moon-DEFAULT'
                    : 'bg-gradient-to-br from-dream-DEFAULT to-dream-dark hover:from-dream-light hover:to-dream-DEFAULT hover:scale-105 border-dream-light shadow-md'
                } text-white font-bold`}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched}
              >
                {card.isFlipped || card.isMatched ? card.symbol : '?'}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-brain-light to-brain-DEFAULT">
        <Button onClick={initializeGame} className="w-full bg-white text-brain-dark hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          New Game
        </Button>
      </CardFooter>
    </Card>
  );
};

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [result, setResult] = useState<string>('');

  const choices = [
    { name: 'Rock', emoji: '🪨', beats: 'Scissors' },
    { name: 'Paper', emoji: '📄', beats: 'Rock' },
    { name: 'Scissors', emoji: '✂️', beats: 'Paper' }
  ];

  const playGame = (playerChoice: string) => {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    
    setPlayerChoice(playerChoice);
    setComputerChoice(computerChoice.name);

    if (playerChoice === computerChoice.name) {
      setResult("It's a tie! 🤝");
    } else if (
      (playerChoice === 'Rock' && computerChoice.name === 'Scissors') ||
      (playerChoice === 'Paper' && computerChoice.name === 'Rock') ||
      (playerChoice === 'Scissors' && computerChoice.name === 'Paper')
    ) {
      setResult('You win! 🎉');
      setPlayerScore(prev => prev + 1);
      toast.success('You won this round!');
    } else {
      setResult('Computer wins! 🤖');
      setComputerScore(prev => prev + 1);
      toast.error('Computer won this round!');
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setPlayerScore(0);
    setComputerScore(0);
    setResult('');
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-gradient-to-br from-white/80 to-orange-light/20 dark:from-nightsky-light/80 dark:to-nightsky/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-center gap-2">
          <Scissors className="w-6 h-6" />
          <CardTitle className="text-2xl font-bold">Rock Paper Scissors</CardTitle>
        </div>
        <CardDescription className="text-orange-100">Choose your weapon!</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex justify-between w-full text-xl font-bold p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-nightsky-light/40 dark:to-nightsky/40 rounded-lg shadow-inner">
            <span className="text-blue-600">You: {playerScore}</span>
            <span className="text-red-600">Computer: {computerScore}</span>
          </div>
          
          {result && (
            <div className="text-2xl font-bold text-center p-4 bg-gradient-to-r from-moon-light to-moon-DEFAULT rounded-lg shadow-lg">
              {result}
            </div>
          )}
          
          {playerChoice && computerChoice && (
            <div className="flex justify-between w-full items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-nightsky-light/20 dark:to-nightsky/20 rounded-2xl shadow-inner">
              <div className="text-center">
                <div className="text-6xl mb-3 animate-bounce">
                  {choices.find(c => c.name === playerChoice)?.emoji}
                </div>
                <div className="text-lg font-semibold text-blue-600">You</div>
              </div>
              <div className="text-3xl font-bold text-gray-500">VS</div>
              <div className="text-center">
                <div className="text-6xl mb-3 animate-bounce">
                  {choices.find(c => c.name === computerChoice)?.emoji}
                </div>
                <div className="text-lg font-semibold text-red-600">Computer</div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {choices.map((choice) => (
              <button
                key={choice.name}
                onClick={() => playGame(choice.name)}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-white to-gray-100 hover:from-dream-light hover:to-dream-DEFAULT dark:from-nightsky-light dark:to-nightsky hover:shadow-2xl border-2 border-dream-light/40 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <span className="text-4xl mb-3">{choice.emoji}</span>
                <span className="text-lg font-semibold">{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-orange-400 to-red-400">
        <Button onClick={resetGame} className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          Reset Score
        </Button>
      </CardFooter>
    </Card>
  );
};

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const boardSize = 20;

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize)
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    generateFood();
  };

  const startGame = () => {
    setGameStarted(true);
    setDirection({ x: 1, y: 0 });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        
        head.x += direction.x;
        head.y += direction.y;

        if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
          setGameOver(true);
          toast.error(`Game Over! Final Score: ${score}`);
          return prevSnake;
        }

        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          toast.error(`Game Over! Final Score: ${score}`);
          return prevSnake;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(gameInterval);
  }, [direction, food, gameStarted, gameOver, score, generateFood]);

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-gradient-to-br from-white/80 to-green-light/20 dark:from-nightsky-light/80 dark:to-nightsky/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-6 h-6" />
          <CardTitle className="text-2xl font-bold">Snake Game</CardTitle>
        </div>
        <CardDescription className="text-green-100">Use arrow keys to control the snake</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-2xl font-bold p-4 bg-gradient-to-r from-moon-light to-moon-DEFAULT rounded-lg shadow-inner">
            Score: {score}
          </div>
          
          <div 
            className="grid bg-gradient-to-br from-green-100 to-emerald-100 dark:from-nightsky-light/30 dark:to-nightsky/30 border-4 border-green-400 rounded-2xl p-4 shadow-2xl"
            style={{ 
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
              width: '320px',
              height: '320px'
            }}
          >
            {Array.from({ length: boardSize * boardSize }).map((_, index) => {
              const x = index % boardSize;
              const y = Math.floor(index / boardSize);
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              const isHead = snake[0]?.x === x && snake[0]?.y === y;
              
              return (
                <div
                  key={index}
                  className={`border border-green-200/30 rounded-sm ${
                    isSnake 
                      ? isHead 
                        ? 'bg-gradient-to-br from-green-600 to-green-800 shadow-md' 
                        : 'bg-gradient-to-br from-green-400 to-green-600'
                      : isFood 
                        ? 'bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg animate-pulse' 
                        : 'bg-transparent'
                  }`}
                />
              );
            })}
          </div>
          
          {gameOver && (
            <div className="text-2xl font-bold text-center text-red-500 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-lg">
              🐍 Game Over! 💀
            </div>
          )}
          
          {!gameStarted && !gameOver && (
            <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg shadow-lg">
              <p className="mb-2 text-lg font-semibold">🎮 Ready to play?</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Use arrow keys to move!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-green-400 to-emerald-500">
        {!gameStarted && !gameOver ? (
          <Button onClick={startGame} className="w-full bg-white text-green-600 hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            🎮 Start Game
          </Button>
        ) : (
          <Button onClick={resetGame} className="w-full bg-white text-green-600 hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            🔄 New Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const HangmanGame = () => {
  const words = [
    'javascript', 'python', 'react', 'computer', 'programming', 
    'developer', 'website', 'function', 'variable', 'algorithm'
  ];
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuessCount, setWrongGuessCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hint, setHint] = useState('');
  
  const maxGuesses = 6;

  const hints: { [key: string]: string } = {
    'javascript': 'Popular programming language for web development',
    'python': 'Snake-named programming language',
    'react': 'JavaScript library for building user interfaces',
    'computer': 'Electronic device for processing data',
    'programming': 'The process of creating computer software',
    'developer': 'Person who writes code',
    'website': 'Collection of web pages',
    'function': 'Block of reusable code',
    'variable': 'Storage location with a name',
    'algorithm': 'Step-by-step procedure for solving a problem'
  };

  const initGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setHint(hints[randomWord] || 'No hint available');
    setGuessedLetters([]);
    setWrongGuessCount(0);
    setGameOver(false);
    setGameWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (currentWord && guessedLetters.length > 0) {
      const wordLetters = [...new Set(currentWord.toLowerCase().split(''))];
      const correctGuesses = wordLetters.filter(letter => guessedLetters.includes(letter));
      
      if (correctGuesses.length === wordLetters.length) {
        setGameWon(true);
        setGameOver(true);
        toast.success('🎉 Congratulations! You guessed the word!');
      } else if (wrongGuessCount >= maxGuesses) {
        setGameOver(true);
        toast.error(`💀 Game Over! The word was: ${currentWord.toUpperCase()}`);
      }
    }
  }, [guessedLetters, wrongGuessCount, currentWord]);

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!currentWord.toLowerCase().includes(letter)) {
      setWrongGuessCount(prev => prev + 1);
    }
  };

  const getDisplayWord = () => {
    return currentWord
      .split('')
      .map(letter => guessedLetters.includes(letter.toLowerCase()) ? letter.toUpperCase() : '_')
      .join(' ');
  };

  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  const getHangmanSvg = () => {
    const parts = [
      wrongGuessCount > 0 ? <circle key="head" cx="50" cy="25" r="10" stroke="#ef4444" strokeWidth="3" fill="none" /> : null,
      wrongGuessCount > 1 ? <line key="body" x1="50" y1="35" x2="50" y2="70" stroke="#ef4444" strokeWidth="3" /> : null,
      wrongGuessCount > 2 ? <line key="leftarm" x1="50" y1="45" x2="35" y2="55" stroke="#ef4444" strokeWidth="3" /> : null,
      wrongGuessCount > 3 ? <line key="rightarm" x1="50" y1="45" x2="65" y2="55" stroke="#ef4444" strokeWidth="3" /> : null,
      wrongGuessCount > 4 ? <line key="leftleg" x1="50" y1="70" x2="35" y2="85" stroke="#ef4444" strokeWidth="3" /> : null,
      wrongGuessCount > 5 ? <line key="rightleg" x1="50" y1="70" x2="65" y2="85" stroke="#ef4444" strokeWidth="3" /> : null,
    ];

    return (
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
        <svg width="120" height="120" className="mb-4">
          <line x1="10" y1="110" x2="70" y2="110" stroke="#8b5a3c" strokeWidth="4" />
          <line x1="30" y1="110" x2="30" y2="10" stroke="#8b5a3c" strokeWidth="4" />
          <line x1="30" y1="10" x2="50" y2="10" stroke="#8b5a3c" strokeWidth="4" />
          <line x1="50" y1="10" x2="50" y2="15" stroke="#8b5a3c" strokeWidth="3" />
          {parts}
        </svg>
        <div className="text-lg font-semibold text-gray-700">
          Wrong Guesses: {wrongGuessCount} / {maxGuesses}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-2xl border border-blue-200">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TreePine className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-800">Hangman Game</h1>
        </div>
        <p className="text-lg text-gray-600">Guess the word before the drawing completes!</p>
      </div>
      
      <div className="space-y-8">
        {getHangmanSvg()}
        
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg">
          <div className="text-sm text-gray-600 mb-2">
            <strong>💡 Hint:</strong> {hint}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-200">
          <div className="text-5xl font-bold tracking-wider text-center text-gray-800 font-mono mb-4">
            {getDisplayWord()}
          </div>
        </div>
        
        {gameOver && (
          <div className={`text-2xl font-bold text-center p-6 rounded-2xl shadow-lg ${
            gameWon 
              ? 'bg-green-100 text-green-700 border-2 border-green-300' 
              : 'bg-red-100 text-red-700 border-2 border-red-300'
          }`}>
            {gameWon ? '🎉 You Won! Great Job!' : `💀 Game Over! Word: ${currentWord.toUpperCase()}`}
          </div>
        )}
        
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <h3 className="text-xl font-semibold mb-6 text-center text-gray-700">Choose a Letter:</h3>
          <div className="grid grid-cols-6 gap-3">
            {alphabet.split('').map(letter => {
              const isGuessed = guessedLetters.includes(letter);
              const isCorrect = isGuessed && currentWord.toLowerCase().includes(letter);
              const isWrong = isGuessed && !currentWord.toLowerCase().includes(letter);
              
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isGuessed || gameOver}
                  className={`
                    p-3 text-lg font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md border-2
                    ${isCorrect 
                      ? 'bg-green-500 text-white border-green-600 shadow-green-200' 
                      : isWrong 
                        ? 'bg-red-500 text-white border-red-600 shadow-red-200'
                        : 'bg-white hover:bg-blue-100 text-gray-700 border-blue-300 hover:border-blue-500 hover:shadow-blue-200'
                    }
                    ${(isGuessed || gameOver) ? 'cursor-not-allowed opacity-60 transform-none' : 'cursor-pointer hover:shadow-lg'}
                  `}
                >
                  {letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={initGame} 
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🎮 New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

const ColoringBook = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="overflow-hidden border-dream-light/20 bg-gradient-to-br from-white/80 to-pink-light/20 dark:from-nightsky-light/80 dark:to-nightsky/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white">
        <div className="flex items-center justify-center gap-2">
          <Palette className="w-6 h-6" />
          <CardTitle className="text-2xl font-bold">{t('games.coloringBook.title')}</CardTitle>
        </div>
        <CardDescription className="text-pink-100">{t('games.coloringBook.description')}</CardDescription>
      </CardHeader>
      <CardContent className="text-center p-12">
        <div className="space-y-6">
          <div className="text-6xl">🎨</div>
          <p className="mb-6 text-xl text-muted-foreground font-semibold">
            {t('games.coloringBook.comingSoon')}
          </p>
          <Button variant="outline" className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-pink-600 hover:from-pink-200 hover:to-purple-200 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            {t('games.coloringBook.seePlans')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Games = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  useEffect(() => {
    document.title = `${t('layout.appName')} - ${t('games.title')}`;
  }, [t]);

  return (
    <div className="py-12 px-4 min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-nightsky-DEFAULT dark:via-nightsky-light dark:to-nightsky">
      <div className="container mx-auto max-w-6xl">
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
              <div className="w-full max-w-lg">
                <TicTacToe />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="memory" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <MemoryCardGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rock-paper-scissors" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <RockPaperScissors />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="snake" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <SnakeGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hangman" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <HangmanGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="coloring" className="mt-8">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
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
