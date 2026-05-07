// Matching-Feature Typen — Story 5.1: Matching-Algorithmus Kern, Story 5.4: Feedback-Loop

// ── Score-Konstanten (gespiegelt von scoring.ts im Edge Function) ───────────

export const MIN_SCORE_THRESHOLD = 50

export const SCORE_WEIGHTS = {
  skill:             0.40,
  experience:        0.20,
  location:          0.15,
  availability:      0.10,
  salary:            0.10,
  switchWillingness: 0.05,
} as const

// ── Match-Kategorien ─────────────────────────────────────────────────────────

export type MatchCategory = 'top_match' | 'good_match' | 'interesting'

// Thresholds für UI-Darstellung
export const CATEGORY_THRESHOLDS = {
  top_match:   80,
  good_match:  65,
  interesting: 50,
} as const

// ── Score-Aufschlüsselung (wie von Supabase `matches`-Tabelle zurückgegeben) ─

export interface MatchScoreBreakdown {
  score: number
  category: MatchCategory
  skillScore: number
  experienceScore: number
  locationScore: number
  availabilityScore: number
  salaryScore: number
  switchWillingnessScore: number
}

// ── Match-Status & Ablehnungsgründe (Story 5.4) ──────────────────────────────

export type MatchStatus = 'aktiv' | 'abgelehnt'

export const REJECTION_REASONS = [
  'Skills nicht ausreichend',
  'Region zu weit',
  'Verfügbarkeit passt nicht',
  'Gehalt zu hoch',
  'Sonstiges',
] as const

export type RejectionReason = typeof REJECTION_REASONS[number]

// ── Match-Row (Supabase `matches`-Tabelle) ───────────────────────────────────

export interface Match {
  id: string
  jobId: string
  candidateId: string
  score: number
  category: MatchCategory
  skillScore: number
  experienceScore: number
  locationScore: number
  availabilityScore: number
  salaryScore: number
  switchWillingnessScore: number
  educationMatch: 'not_evaluated' | 'match' | 'no_match'
  hireProbability: number | null
  visibleUntil: string
  createdAt: string
  // Story 5.4: Status und Ablehnungsgrund
  status: MatchStatus
  rejectionReason: string[] | null
}

// ── Availability-Reihenfolge (für UI-Sortierung) ─────────────────────────────

export type CandidateAvailability =
  | 'immediate'
  | '1_month'
  | '3_months'
  | '6_months'
  | 'flexible'

export const AVAILABILITY_RANK: Record<CandidateAvailability, number> = {
  immediate:  1,
  '1_month':  2,
  '3_months': 3,
  '6_months': 4,
  flexible:   5,
}

// ── Story 6.1: Interaction-Status & Match-Dashboard ──────────────────────────

export type InteractionStatus =
  | 'new'
  | 'interested'
  | 'token_sent'
  | 'candidate_approved'
  | 'candidate_declined'
  | 'candidate_timeout'
  | 'interview_planned'
  | 'interview_done'
  | 'hired'
  | 'not_hired'
  | 'paused'  // Story 6.6: Konto-Einfrierung

// Anonymisierte Kandidaten-Karte (candidate_card composite type aus DB)
// Enthält KEINE PII — PII wird auf DB-Ebene durch SECURITY DEFINER Funktion ausgeschlossen
export interface CandidateCard {
  matchId: string
  candidateId: string
  anonymousId: string
  category: MatchCategory
  score: number
  hireProbability: number | null
  skillScore: number
  experienceScore: number
  salaryScore: number
  locationScore: number
  availabilityScore: number
  switchWillingnessScore: number
  professionalTitle: string
  locationCity: string
  experienceYears: number
  educationType: 'none' | 'ausbildung' | 'studium'
  educationField: string | null
  educationMatch: 'not_evaluated' | 'match' | 'no_match'
  availability: CandidateAvailability
  salaryExpectation: number | null
  salaryCurrency: string
  reasons: string[]
  neutralAssessment: string | null
  recommendation: string | null
  skills: Array<{ name: string; level?: string; years?: number }>
  visibleUntil: string | null
  currentStatus: InteractionStatus | null
  isShortlisted: boolean  // Story 6.5: Vormerken
}

// Aggregierter Überblick pro Job (Rückgabe von get_top_matches_for_company())
export interface CompanyMatchOverview {
  jobId: string
  jobTitle: string
  jobStatus: string
  topCandidates: CandidateCard[]
}

// ── Story 6.2: Recruiter-Kontakt nach Interesse-Signal ────────────────────────
// Rückgabe von get_candidate_contact_for_match() — KEIN Kandidaten-PII
export interface RecruiterContact {
  recruiterFirstName: string
  recruiterLastName: string
  recruiterEmail: string
  recruiterPhone: string | null
  candidateAnonymousId: string
  candidateTitle: string
  candidateLocationCity: string
  candidateExperienceYears: number
}

// ── Story 6.3: Recruiter-seitige Interessenten-Übersicht ──────────────────────
// Rückgabe von get_recruiter_interested_matches()
export interface RecruiterInterestMatch {
  matchId: string
  anonymousId: string
  professionalTitle: string
  jobTitle: string
  companyName: string
  companyId: string
  score: number
  category: MatchCategory
  matchedAt: string
  currentStatus: InteractionStatus  // Story 6.6: NEU — 'interested' oder 'paused'
}
