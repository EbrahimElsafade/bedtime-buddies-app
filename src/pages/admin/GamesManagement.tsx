import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Gamepad2 } from 'lucide-react'

interface GameSetting {
  id: string
  game_id: string
  is_free: boolean
  is_active: boolean
}

const GamesManagement = () => {
  const { t } = useTranslation(['admin', 'games'])
  const [games, setGames] = useState<GameSetting[]>([])
  const [loading, setLoading] = useState(true)

  const GAME_INFO = {
    'tic-tac-toe': { icon: '⭕', title: t('admin:games.ticTacToe') },
    'hangman': { icon: '🎯', title: t('admin:games.hangman') },
    'memory': { icon: '🧠', title: t('admin:games.memoryMatch') },
    'snake': { icon: '🐍', title: t('admin:games.snake') },
    'rock-paper-scissors': { icon: '✂️', title: t('admin:games.rockPaperScissors') },
    'choose-color': { icon: '🎨', title: t('admin:games.chooseColor') },
    'guess-number': { icon: '🔢', title: t('admin:games.guessNumber') },
    'catch-animal': { icon: '🦊', title: t('admin:games.catchAnimal') },
    'puzzle': { icon: '🧩', title: t('admin:games.picturePuzzle') },
    'where-did-it-go': { icon: '🔍', title: t('admin:games.whereDidItGo') },
    'snake-ladder': { icon: '🎲', title: t('admin:games.snakeAndLadder') },
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('game_id')

      if (error) throw error
      setGames(data || [])
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error(t('admin:common.error_loading'))
    } finally {
      setLoading(false)
    }
  }

  const updateGame = async (id: string, field: 'is_free' | 'is_active', value: boolean) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ [field]: value })
        .eq('id', id)

      if (error) throw error

      setGames(games.map(game => 
        game.id === id ? { ...game, [field]: value } : game
      ))

      toast.success(t('admin:common.updated_successfully'))
    } catch (error) {
      console.error('Error updating game:', error)
      toast.error(t('admin:common.error_saving'))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="text-muted-foreground">{t('admin:common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('admin:games.title', 'Games Management')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('admin:games.description', 'Manage game availability and premium status')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map(game => {
          const info = GAME_INFO[game.game_id as keyof typeof GAME_INFO]
          
          return (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{info?.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{info?.title}</CardTitle>
                      <Badge variant={game.is_free ? 'success' : 'accent'} className="mt-1">
                        {game.is_free ? t('games:free') : t('games:premium')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`free-${game.id}`} className="cursor-pointer">
                    {t('admin:games.free_access', 'Free Access')}
                  </Label>
                  <Switch
                    id={`free-${game.id}`}
                    checked={game.is_free}
                    onCheckedChange={(checked) => updateGame(game.id, 'is_free', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`active-${game.id}`} className="cursor-pointer">
                    {t('admin:games.active', 'Active')}
                  </Label>
                  <Switch
                    id={`active-${game.id}`}
                    checked={game.is_active}
                    onCheckedChange={(checked) => updateGame(game.id, 'is_active', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default GamesManagement
