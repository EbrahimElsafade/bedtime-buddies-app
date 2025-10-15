import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { SocialAccount } from '@/types/auth'

export const SocialAccountsManager = () => {
  const { profile, user, linkSocialAccount, unlinkSocialAccount } = useAuth()
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState<SocialAccount | null>(null)

  const linkedAccounts = profile?.linked_accounts || []
  
  // Get actual linked identities from user object
  const actualLinkedProviders = user?.identities?.map(id => id.provider) || []
  
  const availableAccounts: SocialAccount[] = ['google', 'apple', 'linkedin_oidc', 'facebook', 'twitter']

  const getProviderDisplayName = (provider: SocialAccount): string => {
    const names: Record<SocialAccount, string> = {
      google: 'Google',
      apple: 'Apple',
      linkedin_oidc: 'LinkedIn',
      facebook: 'Facebook',
      twitter: 'Twitter'
    }
    return names[provider] || provider
  }

  const handleLinkAccount = async (account: SocialAccount) => {
    if (actualLinkedProviders.includes(account)) {
      toast.error('This account is already linked')
      return
    }

    setLinking(true)
    try {
      await linkSocialAccount(account)
      // The redirect will happen automatically, and linked_accounts will be updated via onAuthStateChange
    } catch (err: any) {
      // Error already handled in context with toast
    } finally {
      setLinking(false)
    }
  }

  const handleUnlinkAccount = async (account: SocialAccount) => {
    // Prevent unlinking the last authentication method
    if (actualLinkedProviders.length <= 1) {
      toast.error('You must keep at least one authentication method')
      return
    }

    setUnlinking(account)
    try {
      await unlinkSocialAccount(account)
    } catch (err: any) {
      // Error already handled in context with toast
    } finally {
      setUnlinking(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Social Accounts</CardTitle>
        <CardDescription>
          Manage your connected social accounts for login and profile display
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Currently Linked Accounts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Connected Accounts</h4>
          {actualLinkedProviders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No social accounts linked</p>
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
          <h4 className="text-sm font-medium">Add Account</h4>
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
            <p className="text-sm text-muted-foreground">All accounts are linked</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> You must keep at least one authentication method linked. 
            Linking accounts allows you to sign in using any of your connected providers.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
