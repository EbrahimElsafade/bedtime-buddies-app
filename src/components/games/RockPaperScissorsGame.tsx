
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Hand, Scissors } from "lucide-react";

const RockPaperScissorsGame = () => {
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

          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-center space-x-12 mb-8">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-4 border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
                  <div className="text-6xl">
                    {isPlaying ? '🤔' : playerChoice ? getChoiceEmoji(playerChoice) : '❓'}
                  </div>
                </div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">You</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 animate-pulse">⚡</div>
                <div className="text-sm text-gray-500 mt-2">VS</div>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-4 border-red-400 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
                  <div className="text-6xl">
                    {isPlaying ? '🤖' : computerChoice ? getChoiceEmoji(computerChoice) : '❓'}
                  </div>
                </div>
                <div className="text-lg font-semibold text-red-500">Computer</div>
              </div>
            </div>

            {result && !isPlaying && (
              <div className="text-center mb-6">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
                  {result}
                </div>
              </div>
            )}

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

export default RockPaperScissorsGame;
