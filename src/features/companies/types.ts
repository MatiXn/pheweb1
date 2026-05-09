// Feature-spezifische Typen für das companies Feature
export type { CompanyProfileData, CompanyProfileState } from './hooks/useCompanyProfile'

// ── Subscription-Typen (Story 8.1) ────────────────────────────────────────────
export type SubscriptionTier = 'basis' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'aktiv' | 'ablaufend' | 'abgelaufen' | 'eingefroren' | 'ausstehend_zahlung'

export interface SubscriptionInfo {
  id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeSubscriptionId: string | null
  stripeCustomerId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  createdAt: string
  bankTransferReference?: string | null
  bankTransferRequestedAt?: string | null
  expiresAt?: string | null
}
