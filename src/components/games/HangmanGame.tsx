import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const HangmanGame = () => {
  const { t, i18n } = useTranslation('common')
  const [currentWord, setCurrentWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>(
    'playing',
  )
  const [hint, setHint] = useState('')

  const words = [
    { word: 'RAINBOW', hint: t('games.hangman.hints.rainbow') },
    { word: 'BUTTERFLY', hint: t('games.hangman.hints.butterfly') },
    { word: 'ELEPHANT', hint: t('games.hangman.hints.elephant') },
    { word: 'CHOCOLATE', hint: t('games.hangman.hints.chocolate') },
    { word: 'AIRPLANE', hint: t('games.hangman.hints.airplane') },
    { word: 'COMPUTER', hint: t('games.hangman.hints.computer') },
    { word: 'BIRTHDAY', hint: t('games.hangman.hints.birthday') },
    { word: 'MOUNTAIN', hint: t('games.hangman.hints.mountain') },
  ]

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const maxWrongGuesses = 6
  const isRTL = i18n.language === 'ar'

  const initializeGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(randomWord.word)
    setHint(randomWord.hint)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameStatus('playing')
  }

  useEffect(() => {
    initializeGame()
  }, [])

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return

    const newGuessedLetters = [...guessedLetters, letter]
    setGuessedLetters(newGuessedLetters)

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost')
        toast.error(
          `${t('games.hangman.gameOver')} The word was "${currentWord}"`,
        )
      }
    } else {
      const wordLetters = currentWord.split('')
      const isComplete = wordLetters.every(letter =>
        newGuessedLetters.includes(letter),
      )

      if (isComplete) {
        setGameStatus('won')
        toast.success(t('games.hangman.youWin'))
      }
    }
  }

  const displayWord = () => {
    return currentWord
      .split('')
      .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
      .join(' ')
  }

  const drawHangman = () => {
    return (
      <div className="relative mx-auto h-40 w-32 rounded-lg border-4 border-gray-800 bg-white dark:border-gray-200 dark:bg-nightsky-light md:h-64 md:w-48">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 250"
          className="absolute inset-0"
        >
          <line
            x1="10"
            y1="230"
            x2="100"
            y2="230"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="30"
            y1="230"
            x2="30"
            y2="20"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="30"
            y1="20"
            x2="120"
            y2="20"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="120"
            y1="20"
            x2="120"
            y2="50"
            stroke="currentColor"
            strokeWidth="4"
          />

          {wrongGuesses >= 1 && (
            <circle
              cx="120"
              cy="65"
              r="15"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
          )}

          {wrongGuesses >= 2 && (
            <line
              x1="120"
              y1="80"
              x2="120"
              y2="150"
              stroke="currentColor"
              strokeWidth="3"
            />
          )}

          {wrongGuesses >= 3 && (
            <line
              x1="120"
              y1="100"
              x2="90"
              y2="130"
              stroke="currentColor"
              strokeWidth="3"
            />
          )}

          {wrongGuesses >= 4 && (
            <line
              x1="120"
              y1="100"
              x2="150"
              y2="130"
              stroke="currentColor"
              strokeWidth="3"
            />
          )}

          {wrongGuesses >= 5 && (
            <line
              x1="120"
              y1="150"
              x2="90"
              y2="190"
              stroke="currentColor"
              strokeWidth="3"
            />
          )}

          {wrongGuesses >= 6 && (
            <line
              x1="120"
              y1="150"
              x2="150"
              y2="190"
              stroke="currentColor"
              strokeWidth="3"
            />
          )}
        </svg>

        {gameStatus === 'lost' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <div className="text-center text-white">
              <div className="mb-2 text-2xl md:text-4xl">😔</div>
              <div className="text-sm font-bold text-red-400 md:text-xl">
                TRY AGAIN!
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="overflow-hidden border-dream-light/20 bg-white/50 backdrop-blur-sm dark:bg-nightsky-light/50">
        <CardHeader className="px-4 py-4 text-center">
          <CardTitle className="from-dream-DEFAULT bg-gradient-to-r to-purple-600 bg-clip-text text-xl font-bold md:text-2xl">
            {t('games.hangman.title')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {t('games.hangman.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex flex-col items-start gap-4 md:gap-8 lg:flex-row">
            <div className="w-full flex-shrink-0 lg:w-auto">
              <div className="mb-4 text-center">
                {gameStatus === 'won' && (
                  <div className="animate-pulse text-lg font-bold text-green-600 md:text-2xl">
                    🎉 {t('games.hangman.youWin')} 🎉
                  </div>
                )}
                {gameStatus === 'lost' && (
                  <div className="animate-pulse text-lg font-bold text-red-600 md:text-2xl">
                    😔 {t('games.hangman.youLose')} 😔
                  </div>
                )}
              </div>

              {drawHangman()}

              <div className="mb-4 mt-2 text-center">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 md:text-sm">
                  {t('games.hangman.title').toUpperCase()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-semibold text-red-600 dark:text-red-400 md:text-lg">
                  {t('games.hangman.incorrectGuesses')} {wrongGuesses} /{' '}
                  {maxWrongGuesses}
                </div>
              </div>
            </div>

            <div className="w-full flex-1 space-y-4 md:space-y-6">
              <div className="text-center">
                <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-r from-white to-gray-100 p-4 font-mono text-2xl font-bold tracking-wider text-gray-800 shadow-inner dark:border-gray-600 dark:from-nightsky-light dark:to-nightsky dark:text-gray-200 md:mb-6 md:p-6 md:text-4xl">
                  {displayWord()}
                </div>

                <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 p-3 shadow-lg dark:border-blue-700 dark:from-blue-900 dark:to-purple-900 md:mb-6 md:p-4">
                  <div className="mb-1 text-xs font-medium text-blue-800 dark:text-blue-200 md:text-sm">
                    {t('games.hangman.hint')}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 md:text-base">
                    {hint}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-wrap justify-center gap-2">
                  {alphabet.map(letter => (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      disabled={
                        guessedLetters.includes(letter) ||
                        gameStatus !== 'playing'
                      }
                      className={`h-10 w-10 rounded-md text-sm font-bold transition-all duration-200 md:h-12 md:w-12 md:text-base ${
                        guessedLetters.includes(letter)
                          ? currentWord.includes(letter)
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-red-500 text-white shadow-lg'
                          : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md hover:scale-105 hover:from-purple-500 hover:to-purple-700'
                      } ${
                        gameStatus !== 'playing'
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
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
            className="from-dream-DEFAULT w-full bg-gradient-to-r to-purple-600 py-3 text-base font-semibold transition-all duration-300 hover:from-dream-dark hover:to-purple-700 md:text-lg"
          >
            {t('games.hangman.newGame')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default HangmanGame
