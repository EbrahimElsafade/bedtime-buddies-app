import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Lock } from 'lucide-react'

const Games = () => {
  const { t } = useTranslation(['games', 'common', 'navigation', 'meta'])
  const { user } = useAuth()
  const [gameSettings, setGameSettings] = useState<Record<string, { is_free: boolean; is_active: boolean }>>({})
  const [hasPremium, setHasPremium] = useState(false)

  useEffect(() => {
    const fetchGameSettings = async () => {
      const { data } = await supabase.from('games').select('*')
      if (data) {
        const settings = data.reduce((acc, game) => {
          acc[game.game_id] = { is_free: game.is_free, is_active: game.is_active }
          return acc
        }, {} as Record<string, { is_free: boolean; is_active: boolean }>)
        setGameSettings(settings)
      }
    }

    const checkPremium = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, subscription_end')
        .eq('id', user.id)
        .single()
      
      if (data?.is_premium && (!data.subscription_end || new Date(data.subscription_end) > new Date())) {
        setHasPremium(true)
      }
    }

    fetchGameSettings()
    checkPremium()
  }, [user])

  const games = [
    {
      id: 'tic-tac-toe',
      title: 'ticTacToe.title',
      description: 'ticTacToe.description',
      icon: '⭕',
    },
    {
      id: 'hangman',
      title: 'hangman.title',
      description: 'hangman.description',
      icon: '🎯',
    },
    {
      id: 'memory',
      title: 'memory.title',
      description: 'memory.description',
      icon: '🧠',
    },
    {
      id: 'snake',
      title: 'snake.title',
      description: 'snake.description',
      icon: '🐍',
    },
    {
      id: 'rock-paper-scissors',
      title: 'rockPaperScissors.title',
      description: 'rockPaperScissors.description',
      icon: '✂️',
    },
    {
      id: 'choose-color',
      title: 'chooseColor.title',
      description: 'chooseColor.description',
      icon: '🎨',
    },
    {
      id: 'guess-number',
      title: 'guessNumber.title',
      description: 'guessNumber.description',
      icon: '🔢',
    },
    // {
    //   id: 'catch-animal',
    //   title: 'catchAnimal.title',
    //   description: 'catchAnimal.description',
    //   icon: '🦊',
    // },
    {
      id: 'puzzle',
      title: 'puzzle.title',
      description: 'puzzle.description',
      icon: '🧩',
    },
    {
      id: 'where-did-it-go',
      title: 'whereDidIt.title',
      description: 'whereDidIt.description',
      icon: '🔍',
    },
    {
      id: 'snake-ladder',
      title: 'snakeLadder.title',
      description: 'snakeLadder.description',
      icon: '🎲',
    },
  ]

  const activeGames = games.filter(game => gameSettings[game.id]?.is_active !== false)

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-3 py-4 md:px-4 md:py-8 lg:py-12">
      <Helmet>
        <title>{t('meta:titles.games')}</title>
        <meta name="description" content={t('meta:descriptions.games')} />
        <meta property="og:title" content={t('meta:titles.games')} />
        <meta
          property="og:description"
          content={t('meta:descriptions.games')}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center md:mb-10 lg:mb-12">
          <h1 className="mb-2 bg-gradient-to-r from-primary-foreground to-purple-600 bg-clip-text text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl px-2 text-xs text-muted-foreground md:text-sm lg:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
          {activeGames.map(game => {
            const isFree = gameSettings[game.id]?.is_free !== false
            const canAccess = isFree || hasPremium

            return (
              <Link 
                key={game.id} 
                to={canAccess ? `/games/${game.id}` : '/subscription'} 
                className="group relative"
              >
                <Card className="flex h-full flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex justify-center">
                      <Badge variant={isFree ? 'success' : 'accent'}>
                        {t(isFree ? 'free' : 'premium')}
                      </Badge>
                    </div>
                    <div className="mb-4 text-6xl relative">
                      {game.icon}
                      {!canAccess && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-foreground/50" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="transition-colors group-hover:text-primary">
                      {t(game.title)}
                    </CardTitle>
                    <CardDescription>{t(game.description)}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Games
