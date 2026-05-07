// Feature-spezifische Typen für das companies Feature
export type { CompanyProfileData, CompanyProfileState } from './hooks/useCompanyProfile'

// ── Subscription-Typen (Story 8.1) ────────────────────────────────────────────
export type SubscriptionTier = 'basis' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'aktiv' | 'ablaufend' | 'abgelaufen' | 'eingefroren'

export interface SubscriptionInfo {
  id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeSubscriptionId: string | null
  stripeCustomerId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  createdAt: string
}
