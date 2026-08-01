import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { isMembershipActive } from '@/utils/membership'
import { useMyPurchasedCourseIds } from '@/hooks/useCoursePurchases'

/**
 * Single source of truth for whether the current user may watch the PAID
 * lessons of a course.
 *
 * Access is granted when the user:
 * - is an admin / staff role, or
 * - has an active (non-expired) premium subscription, or
 * - permanently owns the course (purchased or admin-granted).
 */
export const useCourseAccess = (courseId?: string) => {
  const { user, profile, isProfileLoaded } = useAuth()
  const { isPremium: roleIsPremium, isLoading: roleLoading } = useUserRole(user)
  const { data: ownedCourseIds = [], isLoading: purchasesLoading } =
    useMyPurchasedCourseIds()

  const ownsCourse = !!courseId && ownedCourseIds.includes(courseId)
  const hasActiveMembership = isMembershipActive(profile) || roleIsPremium

  return {
    ownsCourse,
    hasActiveMembership,
    hasAccess: hasActiveMembership || ownsCourse,
    isLoading: (roleLoading && !isProfileLoaded) || (!!user && purchasesLoading),
  }
}
