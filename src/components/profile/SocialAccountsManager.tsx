import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SocialAccount } from '@/types/auth'

export const SocialAccountsManager = () => {
  const { profile, user, linkSocialAccount, unlinkSocialAccount } = useAuth()
  const { t } = useTranslation('common')
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState<SocialAccount | null>(null)

  const linkedAccounts = profile?.linked_accounts || []
  
  // Get actual linked identities from user object
  const actualLinkedProviders = user?.identities?.map(id => id.provider) || []
  
  const availableAccounts: SocialAccount[] = ['google', 'facebook']

  const getProviderDisplayName = (provider: SocialAccount): string => {
    const label = t(`providers.${provider}`)
    return label || provider
  }

  const handleLinkAccount = async (account: SocialAccount) => {
    if (actualLinkedProviders.includes(account)) {
      toast.error(t('accountAlreadyLinked'))
      return
    }

    setLinking(true)
    try {
      await linkSocialAccount(account)
      // The redirect will happen automatically, and linked_accounts will be updated via onAuthStateChange
    } catch (err) {
      // Error already handled in context with toast
    } finally {
      setLinking(false)
    }
  }

  const handleUnlinkAccount = async (account: SocialAccount) => {
    // Prevent unlinking the last authentication method
    if (actualLinkedProviders.length <= 1) {
      toast.error(t('mustKeepOneAuthMethod'))
      return
    }

    setUnlinking(account)
    try {
      await unlinkSocialAccount(account)
    } catch (err) {
      // Error already handled in context with toast
    } finally {
      setUnlinking(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('linkedSocialAccounts')}</CardTitle>
        <CardDescription>
          {t('manageSocialAccounts')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currently Linked Accounts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('connectedAccounts')}</h4>
          {actualLinkedProviders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noSocialAccountsLinked')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {actualLinkedProviders.map((account) => (
                <Badge key={account} variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
                  {getProviderDisplayName(account as SocialAccount)}
                  <button
                    onClick={() => handleUnlinkAccount(account as SocialAccount)}
                    disabled={unlinking === account || actualLinkedProviders.length <= 1}
                    className="ml-1 hover:text-destructive disabled:opacity-50"
                  >
                    {unlinking === account ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Available Accounts to Link */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('addAccount')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableAccounts
              .filter(account => !actualLinkedProviders.includes(account))
              .map((account) => (
                <Button
                  key={account}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkAccount(account)}
                  disabled={linking}
                  className="justify-start"
                >
                  {linking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {getProviderDisplayName(account)}
                </Button>
              ))}
          </div>
          {availableAccounts.filter(a => !actualLinkedProviders.includes(a)).length === 0 && (
            <p className="text-sm text-muted-foreground">{t('allAccountsLinked')}</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>{t('noteLabel')}:</strong> {t('socialAccountsNote')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
