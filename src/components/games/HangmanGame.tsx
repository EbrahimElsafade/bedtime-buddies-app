
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

const HangmanGame = () => {
  const { t, i18n } = useTranslation('common');
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
  const isRTL = i18n.language === 'ar';

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
        toast.error(`${t('games.hangman.gameOver')} The word was "${currentWord}"`);
      }
    } else {
      const wordLetters = currentWord.split('');
      const isComplete = wordLetters.every(letter => newGuessedLetters.includes(letter));
      
      if (isComplete) {
        setGameStatus('won');
        toast.success(t('games.hangman.youWin'));
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
      <div className="relative w-32 h-40 md:w-48 md:h-64 border-4 border-gray-800 dark:border-gray-200 bg-white dark:bg-nightsky-light rounded-lg mx-auto">
        <svg width="100%" height="100%" viewBox="0 0 200 250" className="absolute inset-0">
          <line x1="10" y1="230" x2="100" y2="230" stroke="currentColor" strokeWidth="4"/>
          <line x1="30" y1="230" x2="30" y2="20" stroke="currentColor" strokeWidth="4"/>
          <line x1="30" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="4"/>
          <line x1="120" y1="20" x2="120" y2="50" stroke="currentColor" strokeWidth="4"/>
          
          {wrongGuesses >= 1 && (
            <circle cx="120" cy="65" r="15" stroke="currentColor" strokeWidth="3" fill="none"/>
          )}
          
          {wrongGuesses >= 2 && (
            <line x1="120" y1="80" x2="120" y2="150" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {wrongGuesses >= 3 && (
            <line x1="120" y1="100" x2="90" y2="130" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {wrongGuesses >= 4 && (
            <line x1="120" y1="100" x2="150" y2="130" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {wrongGuesses >= 5 && (
            <line x1="120" y1="150" x2="90" y2="190" stroke="currentColor" strokeWidth="3"/>
          )}
          
          {wrongGuesses >= 6 && (
            <line x1="120" y1="150" x2="150" y2="190" stroke="currentColor" strokeWidth="3"/>
          )}
        </svg>
        
        {gameStatus === 'lost' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center text-white">
              <div className="text-2xl md:text-4xl mb-2">😔</div>
              <div className="text-sm md:text-xl font-bold text-red-400">TRY AGAIN!</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 dark:bg-nightsky-light/50 backdrop-blur-sm">
        <CardHeader className="text-center px-4 py-4">
          <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-dream-DEFAULT to-purple-600 bg-clip-text text-transparent">
            {t('games.hangman.title')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">{t('games.hangman.description')}</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-start">
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="text-center mb-4">
                {gameStatus === 'won' && (
                  <div className="text-lg md:text-2xl font-bold text-green-600 animate-pulse">
                    🎉 {t('games.hangman.youWin')} 🎉
                  </div>
                )}
                {gameStatus === 'lost' && (
                  <div className="text-lg md:text-2xl font-bold text-red-600 animate-pulse">
                    😔 {t('games.hangman.youLose')} 😔
                  </div>
                )}
              </div>

              {drawHangman()}

              <div className="text-center mt-2 mb-4">
                <div className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {t('games.hangman.title').toUpperCase()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm md:text-lg font-semibold text-red-600 dark:text-red-400">
                  {t('games.hangman.incorrectGuesses')} {wrongGuesses} / {maxWrongGuesses}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 md:space-y-6 w-full">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold font-mono tracking-wider text-gray-800 dark:text-gray-200 mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-100 dark:from-nightsky-light dark:to-nightsky p-4 md:p-6 rounded-lg shadow-inner border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {displayWord()}
                </div>
                
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-3 md:p-4 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700 mb-4 md:mb-6">
                  <div className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    {t('games.hangman.hint')}
                  </div>
                  <div className="text-sm md:text-base text-blue-700 dark:text-blue-300">
                    {hint}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-wrap gap-2 justify-center">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-md font-bold text-sm md:text-base transition-all duration-200 ${
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
        <CardFooter className="px-4 py-4">
          <Button 
            onClick={initializeGame} 
            className="w-full py-3 text-base md:text-lg font-semibold bg-gradient-to-r from-dream-DEFAULT to-purple-600 hover:from-dream-dark hover:to-purple-700 transition-all duration-300"
          >
            {t('games.hangman.newGame')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HangmanGame;
