import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStoryFavorites, useCourseFavorites } from '@/hooks/useFavorites'
import { Course } from '@/types/course'

const Profile = () => {
  const navigate = useNavigate()
  const { user, profile, isAuthenticated, isLoading, updateProfile, logout } =
    useAuth()
  const { t, i18n } = useTranslation(['common', 'auth', 'meta'])
  const { language } = useLanguage()
  const { favorites: storyFavorites, isLoading: storiesLoading } = useStoryFavorites()
  const { favorites: courseFavorites, isLoading: coursesLoading } = useCourseFavorites()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [childName, setChildName] = useState('')
  const [profileLanguage, setProfileLanguage] = useState<
    'en' | 'ar-eg' | 'ar-fos7a' | 'fr'
  >('ar-fos7a')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
    if (!isLoading && !isAuthenticated) {
      console.log('Profile - Not authenticated, redirecting to login')
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

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

    setIsSaving(true)
    try {
      await updateProfile({
        parent_name: name,
        child_name: childName || undefined,
        preferred_language: profileLanguage,
      })

      setIsEditing(false)
      toast.success(t('common:profileUpdated'))
    } catch (error) {
      // Error handled by updateProfile
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

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

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>{t('common:loading')}</p>
        </div>
      </div>
    )
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
        <meta property="og:description" content={t('meta:descriptions.profile')} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto max-w-5xl">
        <h1 className="mb-6 font-bubbly text-3xl md:text-4xl">
          {t('common:myProfile')}
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">{t('common:profile')}</TabsTrigger>
            <TabsTrigger value="story-favorites">{t('common:storyFavorites')}</TabsTrigger>
            <TabsTrigger value="course-favorites">{t('common:courseFavorites')}</TabsTrigger>
            <TabsTrigger value="subscription">
              {t('common:subscription')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:personalInformation')}</CardTitle>
                <CardDescription>
                  {isEditing
                    ? t('common:editProfileDescription')
                    : t('common:viewProfileDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('common:yourName')}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('common:email')}</Label>
                    <Input id="email" value={email} disabled />
                    <p className="text-xs text-muted-foreground">
                      {t('common:emailCannotChange')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childName">{t('common:childName')}</Label>
                    <Input
                      id="childName"
                      value={childName}
                      onChange={e => setChildName(e.target.value)}
                      disabled={!isEditing}
                      placeholder={
                        isEditing
                          ? t('common:enterChildName')
                          : t('common:notProvided')
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">
                      {t('common:preferredLanguage')}
                    </Label>
                    {isEditing ? (
                        <Select
                        value={profileLanguage}
                        onValueChange={value =>
                          setProfileLanguage(
                            value as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr',
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar-eg">مصري</SelectItem>
                          <SelectItem value="ar-fos7a">
                            فصحي
                          </SelectItem>
                          <SelectItem value="fr">français</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={getLanguageDisplayName(profileLanguage)}
                        disabled
                      />
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      {t('common:cancel')}
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common:saving')}
                        </>
                      ) : (
                        t('common:saveChanges')
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleLogout}>
                      {t('auth:logout')}
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      {t('common:editProfile')}
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Story Favorites Tab */}
          <TabsContent value="story-favorites">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:myFavoriteStories')}</CardTitle>
                <CardDescription>
                  {t('common:favoriteStoriesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {storiesLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                    <p>{t('common:loading')}</p>
                  </div>
                ) : storyFavorites.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="mb-4 text-muted-foreground">
                      {t('common:noFavoriteStoriesYet')}
                    </p>
                    <Button onClick={() => navigate('/stories')}>
                      {t('common:browseStories')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {storyFavorites.map(story => {
                      const storyTitle = typeof story.title === 'object' ? (story.title[language] || story.title.en || '') : '';
                      const storyDesc = typeof story.description === 'object' ? (story.description[language] || story.description.en || '') : '';
                      
                      return (
                        <Card
                          key={story.id}
                          className="cursor-pointer transition-shadow hover:shadow-lg"
                          onClick={() => navigate(`/story/${story.id}`)}
                        >
                          <CardContent className="p-4">
                            {story.cover_image && (
                              <img
                                src={story.cover_image}
                                alt={storyTitle}
                                className="mb-3 h-32 w-full rounded object-cover"
                              />
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="mb-1 font-medium">
                                  {storyTitle}
                                </h4>
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                  {storyDesc}
                                </p>
                              </div>
                              <Heart className="h-5 w-5 flex-shrink-0 fill-red-500 text-red-500" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Favorites Tab */}
          <TabsContent value="course-favorites">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:myFavoriteCourses')}</CardTitle>
                <CardDescription>
                  {t('common:favoriteCoursesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                    <p>{t('common:loading')}</p>
                  </div>
                ) : courseFavorites.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="mb-4 text-muted-foreground">
                      {t('common:noFavoriteCoursesYet')}
                    </p>
                    <Button onClick={() => navigate('/courses')}>
                      {t('common:browseCourses')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courseFavorites.map(course => {
                      const courseTitle = course[`title_${language}` as keyof Course] as string || course.title_en || '';
                      const courseDesc = course[`description_${language}` as keyof Course] as string || course.description_en || '';
                      
                      return (
                        <Card
                          key={course.id}
                          className="cursor-pointer transition-shadow hover:shadow-lg"
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          <CardContent className="p-4">
                            {course.cover_image && (
                              <img
                                src={course.cover_image}
                                alt={courseTitle}
                                className="mb-3 h-32 w-full rounded object-cover"
                              />
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="mb-1 font-medium">
                                  {courseTitle}
                                </h4>
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                  {courseDesc}
                                </p>
                              </div>
                              <Heart className="h-5 w-5 flex-shrink-0 fill-red-500 text-red-500" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:mySubscription')}</CardTitle>
                <CardDescription>
                  {t('common:manageSubscriptionDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-6 text-center">
                  <div className="mb-4 inline-block rounded-full bg-secondary/50 px-4 py-2">
                    <span className="text-sm font-medium">
                      {profile.is_premium
                        ? t('common:premiumPlan')
                        : t('common:freePlan')}
                    </span>
                  </div>

                  {profile.is_premium ? (
                    <p className="mb-6 text-muted-foreground">
                      {t('common:premiumPlanDescription')}
                    </p>
                  ) : (
                    <p className="mb-6 text-muted-foreground">
                      {t('common:freePlanDescription')}
                    </p>
                  )}

                  {!profile.is_premium && (
                    <Button
                      onClick={() => navigate('/subscription')}
                      className="bg-moon-DEFAULT hover:bg-moon-dark"
                    >
                      {t('common:upgradeToPremium')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Profile
