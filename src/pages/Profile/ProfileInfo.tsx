import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { profileUpdateSchema } from '@/utils/validation'
import { toast } from 'sonner'
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload'
import { SocialAccountsManager } from '@/components/profile/SocialAccountsManager'
import { SkillsManager } from '@/components/profile/SkillsManager'
import { SubscriptionProfile } from './SubscriptionProfile'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, KeyRound } from 'lucide-react'

interface ProfileInfoProps {
  name: string
  setName: (name: string) => void
  email: string
  childName: string
  setChildName: (name: string) => void
  profileLanguage: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr'
  setProfileLanguage: (lang: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr') => void
  isPremium?: boolean
  onSave: () => void
  onLogout: () => void
}

export const ProfileInfo = ({
  name,
  setName,
  email,
  childName,
  setChildName,
  profileLanguage,
  setProfileLanguage,
  isPremium = false,
  onSave,
  onLogout,
}: ProfileInfoProps) => {
  const { t } = useTranslation('common')
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const getLanguageDisplayName = (langCode: string) => {
    switch (langCode) {
      case 'en':
        return 'English'
      case 'ar-eg':
        return 'مصري'
      case 'ar-fos7a':
        return 'فصحي'
      case 'ar-su':
        return 'فصحي'
      case 'fr':
        return 'français'
      default:
        return 'فصحي'
    }
  }

  const handleSave = () => {
    // Validate inputs before saving
    const validationResult = profileUpdateSchema.safeParse({
      parentName: name,
      childName: childName || '',
      preferredLanguage: profileLanguage
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    onSave()
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error(t('passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'))
      return
    }

    setIsChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success(t('passwordChanged'))
      setIsPasswordDialogOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
      toast.error(errorMessage)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('personalInformation')}</CardTitle>
        <CardDescription>
          {isEditing
            ? t('editProfileDescription')
            : t('viewProfileDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">{t('profilePicture')}</h3>
            <ProfileImageUpload />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('personalInformation')}</h3>
            <div className="space-y-2">
              <Label htmlFor="name">{t('yourName')}</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" value={email} disabled />
              <p className="text-xs text-muted-foreground">
                {t('emailCannotChange')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="childName">{t('childName')}</Label>
              <Input
                id="childName"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                disabled={!isEditing}
                placeholder={
                  isEditing ? t('enterChildName') : t('notProvided')
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('preferredLanguage')}</Label>
              {isEditing ? (
                <Select
                  value={profileLanguage}
                  onValueChange={value =>
                    setProfileLanguage(value as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar-eg">مصري</SelectItem>
                    <SelectItem value="ar-fos7a">فصحي</SelectItem>
                    <SelectItem value="fr">français</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={getLanguageDisplayName(profileLanguage)} disabled />
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('security')}</h3>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t('changePassword')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('changePassword')}</DialogTitle>
                  <DialogDescription>
                    {t('changePasswordDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">{t('confirmPassword')}</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(false)}
                    disabled={isChangingPassword}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      t('changePassword')
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <SocialAccountsManager />

          <Separator />

          <SkillsManager />

          <Separator />

          <SubscriptionProfile isPremium={isPremium} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave}>{t('saveChanges')}</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onLogout}>
              {t('logout')}
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              {t('editProfile')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
