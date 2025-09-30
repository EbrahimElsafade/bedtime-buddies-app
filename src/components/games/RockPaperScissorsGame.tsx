import { useState } from 'react'
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
import { Hand, Scissors } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const RockPaperScissorsGame = () => {
  const { t } = useTranslation('games')
  const [playerChoice, setPlayerChoice] = useState<string>('')
  const [computerChoice, setComputerChoice] = useState<string>('')
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [result, setResult] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)

  const choices = [
    { name: 'rock', icon: Hand, rotation: 'rotate-90', emoji: '✊' },
    { name: 'paper', icon: Hand, rotation: '', emoji: '✋' },
    { name: 'scissors', icon: Scissors, rotation: '', emoji: '✌️' },
  ]

  const getRandomChoice = () => {
    const randomIndex = Math.floor(Math.random() * choices.length)
    return choices[randomIndex].name
  }

  const determineWinner = (player: string, computer: string) => {
    if (player === computer) return 'tie'

    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'player'
    }
    return 'computer'
  }

  const playGame = (playerChoice: string) => {
    setIsPlaying(true)
    const computerChoice = getRandomChoice()

    setPlayerChoice(playerChoice)
    setComputerChoice(computerChoice)

    setTimeout(() => {
      const winner = determineWinner(playerChoice, computerChoice)

      if (winner === 'player') {
        setPlayerScore(prev => prev + 1)
        setResult(t('rockPaperScissors.youWin'))
        toast.success(t('rockPaperScissors.youWin'))
      } else if (winner === 'computer') {
        setComputerScore(prev => prev + 1)
        setResult(t('rockPaperScissors.computerWins'))
        toast.error(t('rockPaperScissors.computerWins'))
      } else {
        setResult(t('rockPaperScissors.tie'))
        toast.info(t('rockPaperScissors.tie'))
      }

      setIsPlaying(false)
    }, 1500)
  }

  const resetGame = () => {
    setPlayerChoice('')
    setComputerChoice('')
    setPlayerScore(0)
    setComputerScore(0)
    setResult('')
    setIsPlaying(false)
  }

  const getChoiceEmoji = (choice: string) => {
    const choiceObj = choices.find(c => c.name === choice)
    return choiceObj ? choiceObj.emoji : '❓'
  }

  return (
    <Card className="mx-auto max-w-4xl overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader className="px-4 text-center md:px-6">
        <CardTitle className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-xl font-bold md:text-2xl">
          {t('rockPaperScissors.title')}
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          {t('rockPaperScissors.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 md:space-y-8">
          <div className="to-primary/7 flex w-full max-w-sm justify-between rounded-xl bg-gradient-to-r from-primary/5 p-4 shadow-lg md:p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 md:text-3xl">
                {playerScore}
              </div>
              <div className="text-xs font-medium text-gray-600 md:text-sm">
                You
              </div>
            </div>
            <div className="flex items-center text-center">
              <div className="text-xl font-bold text-gray-500 md:text-2xl">
                VS
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 md:text-3xl">
                {computerScore}
              </div>
              <div className="text-xs font-medium text-gray-600 md:text-sm">
                Computer
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="mb-6 flex items-center justify-center gap-6 md:mb-8 md:gap-12">
              <div className="text-center">
                <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-gradient-to-br from-ocean-surface to-primary shadow-lg transition-all duration-300 md:mb-4 md:h-32 md:w-32">
                  <div className="text-3xl md:text-6xl">
                    {isPlaying
                      ? '🤔'
                      : playerChoice
                        ? getChoiceEmoji(playerChoice)
                        : '❓'}
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary md:text-lg">
                  You
                </div>
              </div>

              <div className="text-center">
                <div className="animate-pulse text-2xl font-bold text-gray-500 md:text-3xl">
                  ⚡
                </div>
                <div className="mt-2 text-xs text-gray-500 md:text-sm">VS</div>
              </div>

              <div className="text-center">
                <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-coral-light bg-gradient-to-br from-coral-soft to-coral-light shadow-lg transition-all duration-300 md:mb-4 md:h-32 md:w-32">
                  <div className="text-3xl md:text-6xl">
                    {isPlaying
                      ? '🤖'
                      : computerChoice
                        ? getChoiceEmoji(computerChoice)
                        : '❓'}
                  </div>
                </div>
                <div className="text-sm font-semibold text-red-500 md:text-lg">
                  Computer
                </div>
              </div>
            </div>

            {result && !isPlaying && (
              <div className="mb-4 text-center md:mb-6">
                <div className="animate-pulse bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-xl font-bold md:text-2xl">
                  {result}
                </div>
              </div>
            )}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 md:gap-6">
              {choices.map(choice => {
                return (
                  <button
                    key={choice.name}
                    onClick={() => playGame(choice.name)}
                    disabled={isPlaying}
                    className="border-3 group relative rounded-2xl border-gray-300 bg-gradient-to-br from-white to-gray-50 p-4 transition-all duration-300 hover:scale-105 hover:border-primary hover:from-primary/10 hover:to-purple-100/20 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:p-8"
                  >
                    <div className="flex flex-col items-center space-y-2 md:space-y-3">
                      <div className="text-3xl transition-transform duration-300 group-hover:scale-110 md:text-5xl">
                        {choice.emoji}
                      </div>
                      <div className="text-sm font-bold capitalize text-gray-700 transition-colors group-hover:text-primary-foreground md:text-lg">
                        {t(`rockPaperScissors.${choice.name}`)}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 to-purple-500/0 transition-all duration-300 group-hover:from-primary/10 group-hover:to-purple-500/10"></div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 md:px-6">
        <Button
          onClick={resetGame}
          variant="outline"
          className="w-full py-2 text-base font-semibold transition-all duration-300 hover:bg-primary hover:text-secondary md:py-3 md:text-lg"
        >
          {t('rockPaperScissors.resetGame')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default RockPaperScissorsGame
