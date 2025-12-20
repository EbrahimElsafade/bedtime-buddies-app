import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { logger } from '@/utils/logger'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStoryFavorites, useCourseFavorites } from '@/hooks/useFavorites'
import { useLoading } from '@/contexts/LoadingContext'
import { useGamification } from '@/hooks/useGamification'
import { ProfileInfo } from './Profile/ProfileInfo'
import { FavoritesList } from './Profile/FavoritesList'
import { SubscriptionTab } from './Profile/SubscriptionTab'
import { FinishedContentTab } from './Profile/FinishedContentTab'

const Profile = () => {
  const navigate = useNavigate()
  const { user, profile, isAuthenticated, updateProfile, logout } = useAuth()
  const { setIsLoading: setGlobalLoading } = useLoading()
  const { t, i18n } = useTranslation(['common', 'auth', 'meta'])
  const { language } = useLanguage()
  const { favorites: storyFavorites } = useStoryFavorites()
  const { favorites: courseFavorites } = useCourseFavorites()
  const { stats, finishedStories, finishedCourses, isLoading: gamificationLoading } = useGamification()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [childName, setChildName] = useState('')
  const [profileLanguage, setProfileLanguage] = useState<
    'en' | 'ar-eg' | 'ar-fos7a' | 'fr'
  >('ar-fos7a')

  // Set page title
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: 'en',
      ar: 'ar',
      fr: 'fr',
    }
    const i18nLang = langMap[language] || 'ar'
    if (i18n.language !== i18nLang) {
      i18n.changeLanguage(i18nLang)
    }
  }, [language, i18n])

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isAuthenticated) {
      logger.info('Profile - Not authenticated, redirecting to login')
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Update form data when profile is loaded
  useEffect(() => {
    if (user && profile) {
      setName(profile.parent_name || '')
      setEmail(user.email || '')
      setChildName(profile.child_name || '')
      setProfileLanguage(profile.preferred_language || 'ar-eg')
    }
  }, [user, profile])

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    setGlobalLoading(true)
    try {
      await updateProfile({
        parent_name: name,
        child_name: childName || undefined,
        preferred_language: profileLanguage,
      })

      toast.success(t('common:profileUpdated'))
    } catch (error) {
      // Error handled by updateProfile
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="mb-4">{t('auth:loginRequired')}</p>
          <Button onClick={() => navigate('/login')}>
            {t('auth:goToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="mb-4">{t('common:profileLoadError')}</p>
          <Button
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            {t('auth:logoutTryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[82.7svh] bg-gradient-to-b from-primary/20 to-primary/10 px-4 py-12">
      <Helmet>
        <title>{t('meta:titles.profile')}</title>
        <meta name="description" content={t('meta:descriptions.profile')} />
        <meta property="og:title" content={t('meta:titles.profile')} />
        <meta
          property="og:description"
          content={t('meta:descriptions.profile')}
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto max-w-7xl">
        <div className="mb-4 text-center md:mb-6 lg:mb-8">
          <h1 className="mb-2 text-xl font-bold leading-tight md:mb-3 md:text-2xl lg:mb-4 lg:text-3xl xl:text-4xl">
            {t('common:myProfile')}
          </h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 w-full justify-start gap-2 overflow-x-auto p-1 md:mb-6 lg:mb-8">
            <TabsTrigger value="profile">{t('common:profile')}</TabsTrigger>
            <TabsTrigger value="finished-content">
              {t('common:finishedContent')}
            </TabsTrigger>
            <TabsTrigger value="story-favorites">
              {t('common:storyFavorites')}
            </TabsTrigger>
            <TabsTrigger value="course-favorites">
              {t('common:courseFavorites')}
            </TabsTrigger>
            <TabsTrigger value="subscription">
              {t('common:subscription')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileInfo
              name={name}
              setName={setName}
              email={email}
              childName={childName}
              setChildName={setChildName}
              profileLanguage={profileLanguage}
              setProfileLanguage={setProfileLanguage}
              onSave={handleSaveProfile}
              onLogout={handleLogout}
            />
          </TabsContent>

          {/* Finished Content Tab */}
          <TabsContent value="finished-content">
            <FinishedContentTab
              stats={stats}
              finishedStories={finishedStories}
              finishedCourses={finishedCourses}
              language={language}
              t={t}
              isLoading={gamificationLoading}
            />
          </TabsContent>

          {/* Story Favorites Tab */}
          <TabsContent value="story-favorites">
            <FavoritesList
              type="story"
              favorites={storyFavorites}
              language={language}
              t={t}
            />
          </TabsContent>

          {/* Course Favorites Tab */}
          <TabsContent value="course-favorites">
            <FavoritesList
              type="course"
              favorites={courseFavorites}
              language={language}
              t={t}
            />
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <SubscriptionTab isPremium={profile.is_premium} t={t} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Profile
