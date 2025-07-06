import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

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
        className="w-20 h-20 flex items-center justify-center text-2xl bg-white/70 dark:bg-nightsky-light/70 hover:bg-white/90 dark:hover:bg-nightsky/90 border border-dream-light/30 rounded-md transition-colors"
        onClick={() => handleClick(i)}
      >
        {board[i]}
      </button>
    );
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t('games.ticTacToe.title')}</CardTitle>
        <CardDescription>{t('games.ticTacToe.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-4 text-lg font-medium">
            {winner 
              ? winner === 'draw' 
                ? t('games.ticTacToe.draw')
                : `${t('games.ticTacToe.winner')} ${winner}` 
              : `${t('games.ticTacToe.nextPlayer')} ${isXNext ? '✖️' : '⭕'}`}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetGame} className="w-full bg-dream-DEFAULT hover:bg-dream-dark">
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

  const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

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
        // Match found
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isMatched: true, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          
          // Check if game is won
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          );
          
          if (updatedCards.every(card => card.isMatched)) {
            setIsWon(true);
            toast.success(`Congratulations! You won in ${moves + 1} moves!`);
          }
        }, 1000);
      } else {
        // No match
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
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Memory Card Game</CardTitle>
        <CardDescription>Flip cards to find matching pairs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-4 text-lg font-medium">
            {isWon ? `🎉 You Won in ${moves} moves!` : `Moves: ${moves}`}
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {cards.map((card) => (
              <button
                key={card.id}
                className={`w-16 h-16 flex items-center justify-center text-2xl rounded-md transition-all duration-300 transform ${
                  card.isFlipped || card.isMatched
                    ? 'bg-white/90 dark:bg-nightsky/90 scale-105'
                    : 'bg-dream-DEFAULT hover:bg-dream-dark hover:scale-105'
                } border border-dream-light/30`}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched}
              >
                {card.isFlipped || card.isMatched ? card.symbol : '?'}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeGame} className="w-full bg-dream-DEFAULT hover:bg-dream-dark">
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
      setResult("It's a tie!");
    } else if (
      (playerChoice === 'Rock' && computerChoice.name === 'Scissors') ||
      (playerChoice === 'Paper' && computerChoice.name === 'Rock') ||
      (playerChoice === 'Scissors' && computerChoice.name === 'Paper')
    ) {
      setResult('You win!');
      setPlayerScore(prev => prev + 1);
      toast.success('You won this round!');
    } else {
      setResult('Computer wins!');
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
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Rock Paper Scissors</CardTitle>
        <CardDescription>Choose your weapon and beat the computer!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-between w-full text-lg font-medium">
            <span>You: {playerScore}</span>
            <span>Computer: {computerScore}</span>
          </div>
          
          {result && (
            <div className="text-xl font-bold text-center">
              {result}
            </div>
          )}
          
          {playerChoice && computerChoice && (
            <div className="flex justify-between w-full items-center">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {choices.find(c => c.name === playerChoice)?.emoji}
                </div>
                <div className="text-sm">You</div>
              </div>
              <div className="text-2xl">VS</div>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {choices.find(c => c.name === computerChoice)?.emoji}
                </div>
                <div className="text-sm">Computer</div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {choices.map((choice) => (
              <button
                key={choice.name}
                onClick={() => playGame(choice.name)}
                className="flex flex-col items-center p-4 bg-white/70 dark:bg-nightsky-light/70 hover:bg-white/90 dark:hover:bg-nightsky/90 border border-dream-light/30 rounded-lg transition-colors"
              >
                <span className="text-3xl mb-2">{choice.emoji}</span>
                <span className="text-sm">{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetGame} className="w-full bg-dream-DEFAULT hover:bg-dream-dark">
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

        // Check wall collision
        if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
          setGameOver(true);
          toast.error(`Game Over! Final Score: ${score}`);
          return prevSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          toast.error(`Game Over! Final Score: ${score}`);
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check food collision
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
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Snake Game</CardTitle>
        <CardDescription>Use arrow keys to control the snake</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-lg font-medium">Score: {score}</div>
          
          <div 
            className="grid bg-nightsky-light/30 border-2 border-dream-light/30 rounded-lg p-2"
            style={{ 
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
              width: '300px',
              height: '300px'
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
                  className={`border border-dream-light/10 ${
                    isSnake 
                      ? isHead 
                        ? 'bg-dream-dark' 
                        : 'bg-dream-DEFAULT'
                      : isFood 
                        ? 'bg-moon-DEFAULT' 
                        : 'bg-transparent'
                  }`}
                />
              );
            })}
          </div>
          
          {gameOver && (
            <div className="text-xl font-bold text-center text-red-500">
              Game Over!
            </div>
          )}
          
          {!gameStarted && !gameOver && (
            <div className="text-center">
              <p className="mb-2">Click Start to begin!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!gameStarted && !gameOver ? (
          <Button onClick={startGame} className="w-full bg-dream-DEFAULT hover:bg-dream-dark">
            Start Game
          </Button>
        ) : (
          <Button onClick={resetGame} className="w-full bg-dream-DEFAULT hover:bg-dream-dark">
            New Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const HangmanGame = () => {
  const words = ['JAVASCRIPT', 'PYTHON', 'REACT', 'COMPUTER', 'PROGRAMMING', 'DEVELOPER', 'WEBSITE', 'FUNCTION'];
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  const maxWrongGuesses = 6;

  const initializeGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setGameWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (word && guessedLetters.length > 0) {
      const wordLetters = word.split('');
      const hasWon = wordLetters.every(letter => guessedLetters.includes(letter));
      
      if (hasWon) {
        setGameWon(true);
        setGameOver(true);
        toast.success('Congratulations! You won!');
      } else if (wrongGuesses >= maxWrongGuesses) {
        setGameOver(true);
        toast.error(`Game Over! The word was: ${word}`);
      }
    }
  }, [guessedLetters, wrongGuesses, word]);

  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!word.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const getDisplayWord = () => {
    return word.split('').map(letter => 
      guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
  };

  const getHangmanDrawing = () => {
    const drawings = [
      '',
      '  |\n  |',
      '  +---+\n  |   |\n      |',
      '  +---+\n  |   |\n  O   |',
      '  +---+\n  |   |\n  O   |\n  |   |',
      '  +---+\n  |   |\n  O   |\n /|   |',
      '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |'
    ];
    return drawings[wrongGuesses] || drawings[6];
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Hangman Game</CardTitle>
        <CardDescription>Guess the word letter by letter</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <pre className="font-mono text-sm bg-nightsky-light/20 p-4 rounded-lg border">
              {getHangmanDrawing()}
            </pre>
          </div>
          
          <div className="text-2xl font-bold tracking-wider">
            {getDisplayWord()}
          </div>
          
          <div className="text-lg">
            Wrong guesses: {wrongGuesses}/{maxWrongGuesses}
          </div>
          
          {gameOver && (
            <div className={`text-xl font-bold text-center ${gameWon ? 'text-green-500' : 'text-red-500'}`}>
              {gameWon ? 'You Won!' : `Game Over! Word: ${word}`}
            </div>
          )}
          
          <div className="grid grid-cols-6 gap-2 max-w-md">
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={guessedLetters.includes(letter) || gameOver}
                className={`p-2 text-sm font-bold rounded border transition-colors ${
                  guessedLetters.includes(letter)
                    ? word.includes(letter)
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-white/70 dark:bg-nightsky-light/70 hover:bg-white/90 dark:hover:bg-nightsky/90 border-dream-light/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={initializeGame} className="w-full bg-dream-DEFAULT hover:bg-dream-dark">
          New Game
        </Button>
      </CardFooter>
    </Card>
  );
};

const ColoringBook = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t('games.coloringBook.title')}</CardTitle>
        <CardDescription>{t('games.coloringBook.description')}</CardDescription>
      </CardHeader>
      <CardContent className="text-center p-8">
        <p className="mb-6 text-muted-foreground">
          {t('games.coloringBook.comingSoon')}
        </p>
        <Button variant="outline">{t('games.coloringBook.seePlans')}</Button>
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
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bubbly mb-6">{t('games.title')}</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {t('games.subtitle')}
        </p>
        
        <Tabs defaultValue="tic-tac-toe" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tic-tac-toe">Tic-Tac-Toe</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="rock-paper-scissors">Rock Paper Scissors</TabsTrigger>
            <TabsTrigger value="snake">Snake</TabsTrigger>
            <TabsTrigger value="hangman">Hangman</TabsTrigger>
            <TabsTrigger value="coloring">Coloring</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tic-tac-toe" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <TicTacToe />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="memory" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <MemoryCardGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rock-paper-scissors" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <RockPaperScissors />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="snake" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <SnakeGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hangman" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <HangmanGame />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="coloring" className="mt-6">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
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
