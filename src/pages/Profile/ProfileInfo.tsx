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
import { useTranslation } from 'react-i18next'

interface ProfileInfoProps {
  name: string
  setName: (name: string) => void
  email: string
  childName: string
  setChildName: (name: string) => void
  profileLanguage: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr'
  setProfileLanguage: (lang: 'en' | 'ar-eg' | 'ar-fos7a' | 'fr') => void
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
  onSave,
  onLogout,
}: ProfileInfoProps) => {
  const { t } = useTranslation('common')
  const [isEditing, setIsEditing] = useState(false)

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
    onSave()
    setIsEditing(false)
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
        <div className="space-y-4">
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
              {t('logout', { ns: 'auth' })}
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
