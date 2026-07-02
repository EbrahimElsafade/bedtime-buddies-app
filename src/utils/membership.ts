import type { Profile } from '@/types/auth'

/**
 * Central source of truth for whether a user currently has an ACTIVE paid membership.
 *
 * Rules:
 * - Profile must be marked is_premium=true
 * - subscription_end must exist, be a valid date, and be in the future
 * - Missing / invalid expiration date = treated as expired
 * - Uses the current instant; a membership ending today remains active until
 *   the exact end timestamp stored in the DB (admin-selected date/time).
 */
export const isMembershipActive = (
  profile?: Pick<Profile, 'is_premium' | 'subscription_end'> | null,
): boolean => {
  if (!profile || !profile.is_premium) return false
  if (!profile.subscription_end) return false
  const end = new Date(profile.subscription_end).getTime()
  if (Number.isNaN(end)) return false
  return end > Date.now()
}

/** True when the profile was once premium but the subscription has lapsed. */
export const isMembershipExpired = (
  profile?: Pick<Profile, 'is_premium' | 'subscription_end'> | null,
): boolean => {
  if (!profile?.is_premium) return false
  return !isMembershipActive(profile)
}
