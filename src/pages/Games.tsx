import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Users, Bot, Hand, Scissors, Diamond, Heart, Star, Circle, Square, Triangle, Hexagon, Crown } from "lucide-react";

const TicTacToe = () => {
  const { t } = useTranslation();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'player' | 'computer'>('player');
  const [gameStarted, setGameStarted] = useState(false);
  
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

  const getEmptySquares = (squares: Array<string | null>) => {
    return squares.map((square, index) => square === null ? index : null).filter(val => val !== null);
  };

  const minimax = (squares: Array<string | null>, depth: number, isMaximizing: boolean): number => {
    const winner = calculateWinner(squares);
    
    if (winner === '⭕') return 10 - depth;
    if (winner === '✖️') return depth - 10;
    if (getEmptySquares(squares).length === 0) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = '⭕';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = '✖️';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares: Array<string | null>) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = '⭕';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const makeComputerMove = (currentBoard: Array<string | null>) => {
    const bestMove = getBestMove(currentBoard);
    if (bestMove !== -1) {
      const newBoard = currentBoard.slice();
      newBoard[bestMove] = '⭕';
      setBoard(newBoard);
      setIsXNext(true);

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        toast.success(`${gameWinner} ${t('games.ticTacToe.won')}`);
      } else if (!newBoard.includes(null)) {
        setWinner('draw');
        toast.info(t('games.ticTacToe.draw'));
      }
    }
  };
  
  const handleClick = (i: number) => {
    if (winner || board[i] || !gameStarted) return;
    
    const newBoard = board.slice();
    newBoard[i] = isXNext ? '✖️' : '⭕';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      toast.success(`${gameWinner} ${t('games.ticTacToe.won')}`);
      return;
    } else if (!newBoard.includes(null)) {
      setWinner('draw');
      toast.info(t('games.ticTacToe.draw'));
      return;
    }

    // Computer move in single player mode
    if (gameMode === 'computer' && isXNext) {
      setTimeout(() => {
        makeComputerMove(newBoard);
      }, 500);
    }
  };
  
  const startGameWithMode = (mode: 'player' | 'computer') => {
    setGameMode(mode);
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const backToMenu = () => {
    setGameStarted(false);
    resetGame();
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

  if (!gameStarted) {
    return (
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('games.ticTacToe.title')}</CardTitle>
          <CardDescription>{t('games.ticTacToe.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 text-center">Select Game Mode:</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => startGameWithMode('player')}
                  className="p-6 rounded-lg border-2 transition-all hover:scale-105 border-gray-200 dark:border-gray-700 hover:border-dream-light"
                >
                  <Users className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-center">
                    <div className="font-semibold">Player vs Player</div>
                    <div className="text-sm text-muted-foreground mt-1">Play with a friend</div>
                  </div>
                </button>
                
                <button
                  onClick={() => startGameWithMode('computer')}
                  className="p-6 rounded-lg border-2 transition-all hover:scale-105 border-gray-200 dark:border-gray-700 hover:border-dream-light"
                >
                  <Bot className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-center">
                    <div className="font-semibold">Player vs Computer</div>
                    <div className="text-sm text-muted-foreground mt-1">Challenge the AI</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {t('games.ticTacToe.title')} - {gameMode === 'computer' ? 'vs Computer' : 'vs Player'}
        </CardTitle>
        <CardDescription>{t('games.ticTacToe.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-4 text-lg font-medium">
            {winner 
              ? winner === 'draw' 
                ? t('games.ticTacToe.draw')
                : `${t('games.ticTacToe.winner')} ${winner}` 
              : gameMode === 'computer' 
                ? `${isXNext ? 'Your turn (✖️)' : 'Computer thinking... (⭕)'}`
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
      <CardFooter className="flex gap-2">
        <Button onClick={resetGame} variant="outline" className="flex-1">
          {t('games.ticTacToe.newGame')}
        </Button>
        <Button onClick={backToMenu} className="flex-1 bg-dream-DEFAULT hover:bg-dream-dark">
          Back to Menu
        </Button>
      </CardFooter>
    </Card>
  );
};

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<string>('');
  const [computerChoice, setComputerChoice] = useState<string>('');
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [result, setResult] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  const choices = [
    { name: 'rock', icon: Hand, rotation: 'rotate-90', emoji: '✊' },
    { name: 'paper', icon: Hand, rotation: '', emoji: '✋' },
    { name: 'scissors', icon: Scissors, rotation: '', emoji: '✌️' }
  ];

  const getRandomChoice = () => {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex].name;
  };

  const determineWinner = (player: string, computer: string) => {
    if (player === computer) return 'tie';
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'player';
    }
    return 'computer';
  };

  const playGame = (playerChoice: string) => {
    setIsPlaying(true);
    const computerChoice = getRandomChoice();
    
    setPlayerChoice(playerChoice);
    setComputerChoice(computerChoice);

    setTimeout(() => {
      const winner = determineWinner(playerChoice, computerChoice);
      
      if (winner === 'player') {
        setPlayerScore(prev => prev + 1);
        setResult('You Win!');
        toast.success('You won this round!');
      } else if (winner === 'computer') {
        setComputerScore(prev => prev + 1);
        setResult('Computer Wins!');
        toast.error('Computer won this round!');
      } else {
        setResult("It's a Tie!");
        toast.info("It's a tie!");
      }
      
      setIsPlaying(false);
    }, 1500);
  };

  const resetGame = () => {
    setPlayerChoice('');
    setComputerChoice('');
    setPlayerScore(0);
    setComputerScore(0);
    setResult('');
    setIsPlaying(false);
  };

  const getChoiceEmoji = (choice: string) => {
    const choiceObj = choices.find(c => c.name === choice);
    return choiceObj ? choiceObj.emoji : '❓';
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">
          Rock Paper Scissors
        </CardTitle>
        <CardDescription>Choose your weapon and battle the computer!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-8">
          {/* Score Display */}
          <div className="flex justify-between w-full max-w-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-nightsky-light to-nightsky rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{playerScore}</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">You</div>
            </div>
            <div className="text-center flex items-center">
              <div className="text-2xl font-bold text-gray-500">VS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{computerScore}</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Computer</div>
            </div>
          </div>

          {/* Game Display */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-center space-x-12 mb-8">
              {/* Player Side */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-4 border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
                  <div className="text-6xl">
                    {isPlaying ? '🤔' : playerChoice ? getChoiceEmoji(playerChoice) : '❓'}
                  </div>
                </div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">You</div>
              </div>
              
              {/* VS Indicator */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 animate-pulse">⚡</div>
                <div className="text-sm text-gray-500 mt-2">VS</div>
              </div>
              
              {/* Computer Side */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-4 border-red-400 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
                  <div className="text-6xl">
                    {isPlaying ? '🤖' : computerChoice ? getChoiceEmoji(computerChoice) : '❓'}
                  </div>
                </div>
                <div className="text-lg font-semibold text-red-500">Computer</div>
              </div>
            </div>

            {/* Result Display */}
            {result && !isPlaying && (
              <div className="text-center mb-6">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
                  {result}
                </div>
              </div>
            )}

            {/* Choice Buttons */}
            <div className="grid grid-cols-3 gap-6 w-full">
              {choices.map((choice) => {
                return (
                  <button
                    key={choice.name}
                    onClick={() => playGame(choice.name)}
                    disabled={isPlaying}
                    className="group relative p-8 rounded-2xl border-3 transition-all duration-300 hover:scale-105 hover:shadow-xl border-gray-300 dark:border-gray-600 hover:border-dream-light bg-gradient-to-br from-white to-gray-50 dark:from-nightsky-light dark:to-nightsky hover:from-dream-light/10 hover:to-purple-100/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {choice.emoji}
                      </div>
                      <div className="text-lg font-bold capitalize text-gray-700 dark:text-gray-200 group-hover:text-dream-DEFAULT transition-colors">
                        {choice.name}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-dream-light/0 to-purple-500/0 group-hover:from-dream-light/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={resetGame} 
          variant="outline" 
          className="w-full py-3 text-lg font-semibold hover:bg-dream-light hover:text-white transition-all duration-300"
        >
          Reset Game
        </Button>
      </CardFooter>
    </Card>
  );
};

const HangmanGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [hint, setHint] = useState('');

  const words = [
    { word: 'RAINBOW', hint: 'Colorful light display in sky during rain.' },
    { word: 'BUTTERFLY', hint: 'Beautiful insect with colorful wings.' },
    { word: 'ELEPHANT', hint: 'Large animal with a trunk.' },
    { word: 'CHOCOLATE', hint: 'Sweet treat loved by many.' },
    { word: 'AIRPLANE', hint: 'Flying vehicle in the sky.' },
    { word: 'COMPUTER', hint: 'Electronic device for work and play.' },
    { word: 'BIRTHDAY', hint: 'Special day that comes once a year.' },
    { word: 'MOUNTAIN', hint: 'Very tall natural formation.' }
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const maxWrongGuesses = 6;

  const initializeGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord.word);
    setHint(randomWord.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        toast.error(`Game Over! The word was "${currentWord}"`);
      }
    } else {
      // Check if word is complete
      const wordLetters = currentWord.split('');
      const isComplete = wordLetters.every(letter => newGuessedLetters.includes(letter));
      
      if (isComplete) {
        setGameStatus('won');
        toast.success('Congratulations! You won!');
      }
    }
  };

  const displayWord = () => {
    return currentWord
      .split('')
      .map(letter => guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
  };

  const drawHangman = () => {
    return (
      <div className="relative w-48 h-64 border-4 border-gray-800 dark:border-gray-200 bg-white dark:bg-nightsky-light rounded-lg">
        <svg width="100%" height="100%" viewBox="0 0 200 250" className="absolute inset-0">
          {/* Gallows base */}
          <line x1="10" y1="230" x2="100" y2="230" stroke="currentColor" strokeWidth="4"/>
          {/* Gallows vertical post */}
          <line x1="30" y1="230" x2="30" y2="20" stroke="currentColor" strokeWidth="4"/>
          {/* Gallows horizontal beam */}
          <line x1="30" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="4"/>
          {/* Gallows rope */}
          <line x1="120" y1="20" x2="120" y2="50" stroke="currentColor" strokeWidth="4"/>
          
          {/* Head */}
          {wrongGuesses >= 1 && (
            <circle cx="120" cy="65" r="15" stroke="currentColor" strokeWidth="3" fill="none"/>
          )}
          
          {/* Body */}
          {wrongGuesses >= 2 && (
            <line x1="120" y1="80" x2="120" y2="150" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {/* Left arm */}
          {wrongGuesses >= 3 && (
            <line x1="120" y1="100" x2="90" y2="130" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {/* Right arm */}
          {wrongGuesses >= 4 && (
            <line x1="120" y1="100" x2="150" y2="130" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {/* Left leg */}
          {wrongGuesses >= 5 && (
            <line x1="120" y1="150" x2="90" y2="190" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {/* Right leg */}
          {wrongGuesses >= 6 && (
            <line x1="120" y1="150" x2="150" y2="190" stroke="currentColor" strokeWidth="3"/>
          )}
        </svg>
        
        {/* Game Over overlay */}
        {gameStatus === 'lost' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">😔</div>
              <div className="text-xl font-bold text-red-400">TRY AGAIN!</div>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          HANGMAN GAME
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">
          HANGMAN GAME
        </CardTitle>
        <CardDescription>Guess the word before the drawing is complete!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left side - Hangman drawing */}
          <div className="flex-shrink-0">
            {/* Game Status */}
            <div className="text-center mb-4">
              {gameStatus === 'won' && (
                <div className="text-2xl font-bold text-green-600 animate-pulse">
                  🎉 YOU WON! 🎉
                </div>
              )}
              {gameStatus === 'lost' && (
                <div className="text-2xl font-bold text-red-600 animate-pulse">
                  😔 TRY AGAIN! 😔
                </div>
              )}
            </div>

            {/* Hangman Drawing */}
            {drawHangman()}

            {/* Wrong Guesses Counter */}
            <div className="text-center mt-4">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                Incorrect guesses: {wrongGuesses} / {maxWrongGuesses}
              </div>
            </div>
          </div>

          {/* Right side - Game content */}
          <div className="flex-1 space-y-6">
            {/* Word Display */}
            <div className="text-center">
              <div className="text-4xl font-bold font-mono tracking-wider text-gray-800 dark:text-gray-200 mb-6 bg-gradient-to-r from-white to-gray-100 dark:from-nightsky-light dark:to-nightsky p-6 rounded-lg shadow-inner border-2 border-dashed border-gray-300 dark:border-gray-600">
                {displayWord()}
              </div>
              
              {/* Hint */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700 mb-6">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Hint:
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  {hint}
                </div>
              </div>
            </div>

            {/* Alphabet Buttons */}
            <div className="w-full">
              <div className="grid grid-cols-9 gap-2 mb-3">
                {alphabet.slice(0, 9).map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
                    className={`w-10 h-10 rounded-md font-bold text-sm transition-all duration-200 ${
                      guessedLetters.includes(letter)
                        ? currentWord.includes(letter)
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-red-500 text-white shadow-lg'
                        : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 hover:scale-105 shadow-md'
                    } ${
                      gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-2 mb-3">
                {alphabet.slice(9, 17).map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
                    className={`w-10 h-10 rounded-md font-bold text-sm transition-all duration-200 ${
                      guessedLetters.includes(letter)
                        ? currentWord.includes(letter)
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-red-500 text-white shadow-lg'
                        : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 hover:scale-105 shadow-md'
                    } ${
                      gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-9 gap-2">
                {alphabet.slice(17, 26).map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
                    className={`w-10 h-10 rounded-md font-bold text-sm transition-all duration-200 ${
                      guessedLetters.includes(letter)
                        ? currentWord.includes(letter)
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-red-500 text-white shadow-lg'
                        : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 hover:scale-105 shadow-md'
                    } ${
                      gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
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
    // Create pairs of cards
    for (let i = 0; i < cardIcons.length; i++) {
      // First card of the pair
      gameCards.push({
        id: i * 2,
        icon: cardIcons[i].icon,
        color: cardIcons[i].color,
        isFlipped: false,
        isMatched: false
      });
      // Second card of the pair
      gameCards.push({
        id: i * 2 + 1,
        icon: cardIcons[i].icon,
        color: cardIcons[i].color,
        isFlipped: false,
        isMatched: false
      });
    }
    
    // Shuffle the cards
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
    
    // Flip the card
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
        // Cards match!
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
        // Cards don't match - flip them back
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
          {/* Game Stats */}
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

          {/* Win Message */}
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

          {/* Game Board */}
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="tic-tac-toe">Tic Tac Toe</TabsTrigger>
            <TabsTrigger value="rock-paper-scissors">Rock Paper Scissors</TabsTrigger>
            <TabsTrigger value="hangman">Hangman</TabsTrigger>
            <TabsTrigger value="memory">Memory Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tic-tac-toe" className="mt-0">
            <TicTacToe />
          </TabsContent>
          
          <TabsContent value="rock-paper-scissors" className="mt-0">
            <RockPaperScissors />
          </TabsContent>
          
          <TabsContent value="hangman" className="mt-0">
            <HangmanGame />
          </TabsContent>
          
          <TabsContent value="memory" className="mt-0">
            <MemoryCardGame />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Games;
