import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Users, Bot } from "lucide-react";

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
        className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-3xl sm:text-4xl bg-white/70 dark:bg-nightsky-light/70 hover:bg-white/90 dark:hover:bg-nightsky/90 border-2 border-dream-light/30 rounded-lg transition-colors shadow-lg"
        onClick={() => handleClick(i)}
      >
        {board[i]}
      </button>
    );
  };

  if (!gameStarted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bubbly mb-4">{t('games.ticTacToe.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('games.ticTacToe.description')}</p>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-medium mb-8 text-center">Select Game Mode:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <button
                  onClick={() => startGameWithMode('player')}
                  className="p-8 rounded-xl border-2 transition-all hover:scale-105 border-gray-200 dark:border-gray-700 hover:border-dream-light bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm shadow-lg"
                >
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <div className="text-center">
                    <div className="text-xl font-semibold mb-2">Player vs Player</div>
                    <div className="text-muted-foreground">Play with a friend</div>
                  </div>
                </button>
                
                <button
                  onClick={() => startGameWithMode('computer')}
                  className="p-8 rounded-xl border-2 transition-all hover:scale-105 border-gray-200 dark:border-gray-700 hover:border-dream-light bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm shadow-lg"
                >
                  <Bot className="w-16 h-16 mx-auto mb-4" />
                  <div className="text-center">
                    <div className="text-xl font-semibold mb-2">Player vs Computer</div>
                    <div className="text-muted-foreground">Challenge the AI</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bubbly mb-2">
            {t('games.ticTacToe.title')} - {gameMode === 'computer' ? 'vs Computer' : 'vs Player'}
          </h2>
          <p className="text-muted-foreground">{t('games.ticTacToe.description')}</p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <div className="text-xl font-medium text-center">
            {winner 
              ? winner === 'draw' 
                ? t('games.ticTacToe.draw')
                : `${t('games.ticTacToe.winner')} ${winner}` 
              : gameMode === 'computer' 
                ? `${isXNext ? 'Your turn (✖️)' : 'Computer thinking... (⭕)'}`
                : `${t('games.ticTacToe.nextPlayer')} ${isXNext ? '✖️' : '⭕'}`}
          </div>
          
          <div className="grid grid-cols-3 gap-3 p-6 bg-white/30 dark:bg-nightsky-light/30 rounded-xl backdrop-blur-sm shadow-lg border border-dream-light/20">
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

          <div className="flex gap-4 w-full max-w-md">
            <Button onClick={resetGame} variant="outline" className="flex-1">
              {t('games.ticTacToe.newGame')}
            </Button>
            <Button onClick={backToMenu} className="flex-1 bg-dream-DEFAULT hover:bg-dream-dark">
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
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

const PuzzleGame = () => {
  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Puzzle Game</CardTitle>
        <CardDescription>Coming soon - Mind-bending puzzles for kids</CardDescription>
      </CardHeader>
      <CardContent className="text-center p-8">
        <p className="mb-6 text-muted-foreground">
          This exciting puzzle game is under development!
        </p>
        <Button variant="outline">See Plans</Button>
      </CardContent>
    </Card>
  );
};

const MemoryGame = () => {
  return (
    <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Memory Game</CardTitle>
        <CardDescription>Test your memory with fun card matching</CardDescription>
      </CardHeader>
      <CardContent className="text-center p-8">
        <p className="mb-6 text-muted-foreground">
          This memory card game is coming soon!
        </p>
        <Button variant="outline">See Plans</Button>
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="tic-tac-toe">Tic Tac Toe</TabsTrigger>
            <TabsTrigger value="coloring">Coloring Book</TabsTrigger>
            <TabsTrigger value="puzzle">Puzzle Game</TabsTrigger>
            <TabsTrigger value="memory">Memory Game</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tic-tac-toe" className="mt-0">
            <TicTacToe />
          </TabsContent>
          
          <TabsContent value="coloring" className="mt-0">
            <ColoringBook />
          </TabsContent>
          
          <TabsContent value="puzzle" className="mt-0">
            <PuzzleGame />
          </TabsContent>
          
          <TabsContent value="memory" className="mt-0">
            <MemoryGame />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Games;
