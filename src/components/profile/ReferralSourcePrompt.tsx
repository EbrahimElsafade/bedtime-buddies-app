import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

/**
 * One-time, skippable "How did you hear about us?" pop-up.
 * Shown only to signed-in users who have neither answered nor dismissed it.
 * Any close path (send, "Not now", escape, overlay) persists a decision so it never reappears.
 */
export const ReferralSourcePrompt = () => {
  const { t } = useTranslation('common')
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const savedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setOpen(false)
      return
    }

    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const check = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_source, referral_prompt_dismissed_at')
        .eq('id', user.id)
        .maybeSingle()

      if (!active || error || !data) return
      if (!data.referral_source && !data.referral_prompt_dismissed_at) {
        timer = setTimeout(() => {
          if (active) setOpen(true)
        }, 1500)
      }
    }

    check()
    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [isAuthenticated, user?.id])

  const save = async (answered: boolean) => {
    if (!user?.id || savedRef.current) return
    savedRef.current = true
    setSaving(true)
    setOpen(false)
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

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Escape / overlay / X behave like "Not now"
      void save(false)
      return
    }
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('referralPrompt.question', { defaultValue: 'How did you hear about us?' })}
          </DialogTitle>
          <DialogDescription>
            {t('referralPrompt.placeholder', {
              defaultValue: 'e.g. Facebook, a friend, school...',
            })}
          </DialogDescription>
        </DialogHeader>

        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={t('referralPrompt.placeholder', {
            defaultValue: 'e.g. Facebook, a friend, school...',
          })}
          maxLength={200}
          autoFocus
        />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" disabled={saving} onClick={() => save(false)}>
            {t('referralPrompt.notNow', { defaultValue: 'Not now' })}
          </Button>
          <Button disabled={saving || !value.trim()} onClick={() => save(true)}>
            {t('referralPrompt.send', { defaultValue: 'Send' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReferralSourcePrompt
