import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

/**
 * One-time, skippable "How did you hear about us?" card.
 * Shown only to signed-in users who have neither answered nor dismissed it.
 */
export const ReferralSourcePrompt = () => {
  const { t } = useTranslation('common')
  const { user, isAuthenticated } = useAuth()
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setVisible(false)
      return
    }

    let active = true
    const check = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_source, referral_prompt_dismissed_at')
        .eq('id', user.id)
        .maybeSingle()

      if (!active || error || !data) return
      setVisible(!data.referral_source && !data.referral_prompt_dismissed_at)
    }

    check()
    return () => {
      active = false
    }
  }, [isAuthenticated, user?.id])

  const save = async (answered: boolean) => {
    if (!user?.id) return
    setSaving(true)
    setVisible(false)
    const { error } = await supabase
      .from('profiles')
      .update(
        answered
          ? { referral_source: value.trim() }
          : { referral_prompt_dismissed_at: new Date().toISOString() },
      )
      .eq('id', user.id)
    if (error) logger.warn('Failed to save referral source:', error)
    setSaving(false)
  }

  if (!visible) return null

  return (
    <section className="px-4 py-6">
      <Card className="mx-auto max-w-3xl border-primary/20 bg-card/80">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm font-medium text-foreground">
            {t('referralPrompt.question')}
          </p>
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={t('referralPrompt.placeholder')}
              maxLength={200}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={saving || !value.trim()}
              onClick={() => save(true)}
            >
              {t('referralPrompt.send')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => save(false)}
            >
              {t('referralPrompt.notNow')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default ReferralSourcePrompt
