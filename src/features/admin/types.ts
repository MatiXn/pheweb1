// Feature-spezifische Typen für Admin-Funktionen
// Story 7.1: Kandidaten-Verifizierungs-Queue
// Story 7.4: Unternehmens-Aktivierung & Konto-Management

// ── Kandidaten-Status ──────────────────────────────────────────────────────
// Spiegelt candidate_status enum in der DB
export type CandidateStatus =
  | 'active'
  | 'inactive'
  | 'placed'
  | 'ausstehend_verifizierung'  // Story 7.1: Warte auf Admin-Verifizierung
  | 'dokumente_erforderlich'    // Story 7.2: Admin hat abgelehnt, neue Dokumente nötig
  | 'gesperrt'                  // Story 7.3: Admin hat Kandidat dauerhaft gesperrt

// ── Subscription-Tier ─────────────────────────────────────────────────────
export type SubscriptionTier = 'basis' | 'professional' | 'enterprise'

// ── Dokument-Typ ──────────────────────────────────────────────────────────
// Spiegelt document_type enum in der DB
export type DocumentType = 'lebenslauf' | 'zeugnis' | 'zertifikat' | 'sonstiges'

// ── Kandidaten-Dokument (aus documents-Tabelle) ───────────────────────────
export interface CandidateDocument {
  id: string
  candidateId: string
  storagePath: string
  documentType: DocumentType
  originalFilename: string | null
  fileSizeBytes: number | null
  verified: boolean
  verifiedAt: string | null
  createdAt: string
}

// ── Unternehmens-Konto-Status ─────────────────────────────────────────────
// Spiegelt account_status CHECK-Constraint in companies-Tabelle
export type CompanyAccountStatus = 'ausstehend' | 'aktiv' | 'eingefroren' | 'gesperrt'

// ── Admin-Company-Queue-Eintrag ───────────────────────────────────────────
// Rückgabe von get_admin_company_queue() (snake_case → camelCase)
export interface AdminCompanyQueueEntry {
  companyId: string
  companyName: string
  industry: string | null
  size: string | null
  website: string | null
  contactPersonName: string | null
  contactPersonPhone: string | null
  userEmail: string
  userFirstName: string | null
  userLastName: string | null
  accountStatus: CompanyAccountStatus
  createdAt: string
  welcomeSentAt: string | null
}

// ── Success-Fee ───────────────────────────────────────────────────────────
// Story 7.5: Admin-Monitoring & Success-Fee-Tracking
export type SuccessFeeStatus = 'offen' | 'bezahlt'

export interface SuccessFeeEntry {
  feeId: string
  companyName: string
  candidateAnonId: string | null
  professionalTitle: string
  locationCity: string
  annualSalary: number          // Jahresgehalt in EUR (0 wenn salary_expectation NULL)
  feeAmount: number             // = annualSalary * 0.25
  feeStatus: SuccessFeeStatus
  createdAt: string
  paidAt: string | null
}

// ── Admin Dashboard Metriken ──────────────────────────────────────────────
// Rückgabe von get_admin_dashboard_metrics() (jsonb → camelCase)
export interface AdminDashboardMetrics {
  activeCandidates: number
  pendingVerifications: number
  activeCompanies: number
  activeJobs: number
  matchesToday: number
  hiresThisWeek: number
}

// ── Admin-Verifizierungs-Queue-Eintrag ────────────────────────────────────
// Rückgabe von get_admin_verification_queue() (snake_case → camelCase)
export interface AdminVerificationEntry {
  candidateId: string
  anonymousId: string
  professionalTitle: string
  locationCity: string
  experienceYears: number
  educationType: string
  educationField: string | null
  availability: string
  salaryExpectation: number | null
  salaryCurrency: string
  recruiterRecommendation: string | null
  recruiterNeutralAssessment: string | null
  consentGivenAt: string | null
  createdAt: string
  documentCount: number
  recruiterId: string
  recruiterFirstName: string
  recruiterLastName: string
  subscriptionTier: SubscriptionTier
  completenessScore: number
}
