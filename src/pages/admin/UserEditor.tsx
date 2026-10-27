import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Crown,
  Loader2,
  Search,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
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
import { useCoursesData } from '@/hooks/useCourseData'
import {
  useUserPurchasedCourseIds,
  useSyncUserCoursePurchases,
} from '@/hooks/useCoursePurchases'
import { isMembershipActive } from '@/utils/membership'

type AdminUser = {
  id: string
  parent_name: string
  child_name: string | null
  preferred_language: string
  is_premium: boolean
  subscription_tier: string | null
  subscription_start: string | null
  subscription_end: string | null
  created_at: string
  roles: Array<{ role: string }>
}

const UserEditor = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('admin')

  const [saving, setSaving] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const [grantedCourseIds, setGrantedCourseIds] = useState<string[]>([])
  const [form, setForm] = useState({
    parentName: '',
    childName: '',
    language: 'ar-fos7a',
    isPremium: false,
    subscriptionStart: '',
    subscriptionDuration: 'yearly' as 'yearly' | 'custom',
    subscriptionEnd: '',
  })

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-user', userId],
    enabled: !!userId,
    queryFn: async (): Promise<AdminUser | null> => {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId!).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId!),
      ])
      if (profileRes.error) throw profileRes.error
      if (rolesRes.error) throw rolesRes.error
      if (!profileRes.data) return null
      return {
        ...(profileRes.data as Omit<AdminUser, 'roles'>),
        roles: (rolesRes.data ?? []).map(r => ({ role: r.role as string })),
      }
    },
  })

  const { data: allCourses = [], isLoading: coursesLoading } = useCoursesData()
  const { data: userOwnedCourseIds = [] } = useUserPurchasedCourseIds(userId)
  const syncCoursePurchases = useSyncUserCoursePurchases()

  useEffect(() => {
    setGrantedCourseIds(userOwnedCourseIds)
  }, [userOwnedCourseIds])

  useEffect(() => {
    if (!user) return
    const hasCustomEnd =
      user.subscription_end && user.subscription_start
        ? (() => {
            const autoEnd = new Date(user.subscription_start)
            autoEnd.setFullYear(autoEnd.getFullYear() + 1)
            return (
              autoEnd.toISOString().split('T')[0] !==
              user.subscription_end!.split('T')[0]
            )
          })()
        : false

    setForm({
      parentName: user.parent_name ?? '',
      childName: user.child_name ?? '',
      language: user.preferred_language ?? 'ar-fos7a',
      isPremium: user.is_premium,
      subscriptionStart: user.subscription_start?.split('T')[0] ?? '',
      subscriptionDuration: hasCustomEnd ? 'custom' : 'yearly',
      subscriptionEnd: user.subscription_end?.split('T')[0] ?? '',
    })
  }, [user])

  const role = useMemo(() => {
    if (!user) return 'user'
    if (user.roles.some(r => r.role === 'admin')) return 'admin'
    if (user.roles.some(r => r.role === 'editor')) return 'editor'
    return 'user'
  }, [user])

  const filteredCourses = useMemo(() => {
    const term = courseSearch.trim().toLowerCase()
    if (!term) return allCourses
    return allCourses.filter(course => {
      const titles = [
        (course as { title?: string }).title,
        course.title_en,
        course.title_ar,
        course.title_fr,
      ]
      return titles.some(v => v?.toLowerCase().includes(term))
    })
  }, [allCourses, courseSearch])

  const handleSave = async () => {
    if (!user) return
    if (!form.parentName.trim()) {
      toast.error(t('users.parentName'))
      return
    }

    let subscriptionEnd: string | null = null
    if (form.isPremium && form.subscriptionStart) {
      if (form.subscriptionDuration === 'yearly') {
        const start = new Date(form.subscriptionStart)
        start.setFullYear(start.getFullYear() + 1)
        subscriptionEnd = start.toISOString().split('T')[0]
      } else if (form.subscriptionEnd) {
        subscriptionEnd = form.subscriptionEnd
      }
    }

    setSaving(true)
    try {
      const res = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update',
          userId: user.id,
          parentName: form.parentName,
          childName: form.childName || null,
          preferredLanguage: form.language,
          isPremium: form.isPremium,
          subscriptionTier: form.isPremium ? 'yearly' : null,
          subscriptionStart:
            form.isPremium && form.subscriptionStart
              ? form.subscriptionStart
              : null,
          subscriptionEnd,
        },
      })
      if (res.error) throw new Error(res.error.message)
      if (res.data?.error) throw new Error(res.data.error)

      await syncCoursePurchases(user.id, grantedCourseIds, userOwnedCourseIds)
      toast.success(t('users.userUpdated'))
      await refetch()
      navigate('/admin/users')
    } catch (error) {
      logger.error('Edit user error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update user',
      )
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">{t('users.noUsersFound')}</p>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('users.title')}
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ms-2"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('users.title')}
          </Button>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {t('users.editUser')}
          </h1>
          <p className="text-muted-foreground">{user.parent_name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === 'admin' && (
            <Badge className="bg-red-600 hover:bg-red-700">
              <ShieldCheck className="mr-1 h-3 w-3" />
              {t('users.roleAdmin')}
            </Badge>
          )}
          {role === 'editor' && (
            <Badge className="bg-blue-600 hover:bg-blue-700">
              <ShieldCheck className="mr-1 h-3 w-3" />
              {t('users.roleEditor')}
            </Badge>
          )}
          {role === 'user' && (
            <Badge variant="outline">
              <UserIcon className="mr-1 h-3 w-3" />
              {t('users.roleUser')}
            </Badge>
          )}
          {!user.is_premium ? (
            <Badge variant="outline">{t('users.free')}</Badge>
          ) : isMembershipActive(user as never) ? (
            <Badge className="bg-moon-DEFAULT hover:bg-moon-dark">
              {t('users.premium')}
            </Badge>
          ) : (
            <Badge variant="destructive">{t('users.expired')}</Badge>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('users.userInformation')}
            </CardTitle>
            <CardDescription>{t('users.editUserDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('users.parentName')} *</Label>
              <Input
                value={form.parentName}
                onChange={e =>
                  setForm(f => ({ ...f, parentName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.childName')}</Label>
              <Input
                value={form.childName}
                onChange={e =>
                  setForm(f => ({ ...f, childName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('users.preferredLanguage')}</Label>
              <Select
                value={form.language}
                onValueChange={v => setForm(f => ({ ...f, language: v }))}
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
            </div>
            <p className="text-xs text-muted-foreground">
              {t('users.registered')}:{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Subscription (admin only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-4 w-4 text-yellow-500" />
              {t('users.subscriptionSectionTitle')}
            </CardTitle>
            <CardDescription>
              {t('users.subscriptionSectionDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>{t('users.premiumStatus')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('users.premiumStatusDesc')}
                </p>
              </div>
              <Switch
                checked={form.isPremium}
                onCheckedChange={v => setForm(f => ({ ...f, isPremium: v }))}
              />
            </div>
            {form.isPremium && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{t('users.startDate')}</Label>
                  <Input
                    type="date"
                    value={form.subscriptionStart}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        subscriptionStart: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('users.subscriptionDuration')}</Label>
                  <Select
                    value={form.subscriptionDuration}
                    onValueChange={v =>
                      setForm(f => ({
                        ...f,
                        subscriptionDuration: v as 'yearly' | 'custom',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">
                        {t('users.oneYear')}
                      </SelectItem>
                      <SelectItem value="custom">
                        {t('users.customEndDate')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.subscriptionDuration === 'yearly' ? (
                  <p className="text-xs text-muted-foreground">
                    {t('users.yearlySubscriptionNote')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label>{t('users.endDate')}</Label>
                    <Input
                      type="date"
                      value={form.subscriptionEnd}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          subscriptionEnd: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('users.leaveEmptyForUnlimited')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchased courses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('users.courseAccess')}</CardTitle>
            <CardDescription>{t('users.courseAccessDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder={t('users.searchCourses')}
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {grantedCourseIds.length} / {allCourses.length}
              </span>
            </div>

            {coursesLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('users.noCoursesFound')}
              </p>
            ) : (
              <div className="grid max-h-[22rem] gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map(course => {
                  const checked = grantedCourseIds.includes(course.id)
                  return (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={isChecked =>
                          setGrantedCourseIds(ids =>
                            isChecked
                              ? [...new Set([...ids, course.id])]
                              : ids.filter(id => id !== course.id),
                          )
                        }
                      />
                      <span className="line-clamp-2">
                        {(course as { title?: string }).title ||
                          course.title_en ||
                          course.title_ar}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            {t('forms.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('forms.saving')}
              </>
            ) : (
              t('forms.saveChanges')
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UserEditor
