// Public API des Matching-Features — Story 5.1 + Story 5.4 + Story 6.1 + Story 6.2 + Story 6.4 + Story 6.5

export type {
  Match,
  MatchCategory,
  MatchScoreBreakdown,
  CandidateAvailability,
  // Story 5.4
  MatchStatus,
  RejectionReason,
  // Story 6.1
  InteractionStatus,
  CandidateCard,
  CompanyMatchOverview,
  // Story 6.2
  RecruiterContact,
  // Story 6.3
  RecruiterInterestMatch,
} from './types'

export {
  MIN_SCORE_THRESHOLD,
  SCORE_WEIGHTS,
  CATEGORY_THRESHOLDS,
  AVAILABILITY_RANK,
  // Story 5.4
  REJECTION_REASONS,
} from './types'

// Story 5.4: Hooks + Komponenten
export { useMatchRejection } from './hooks/useMatchRejection'
export { MatchRejectionModal } from './components/MatchRejectionModal'

// Story 6.1: Hooks + Komponenten
export { useCompanyMatches } from './hooks/useCompanyMatches'
export { useInteractionTransition } from './hooks/useInteractionTransition'
export { MatchCard } from './components/MatchCard'

// Story 6.2: Hooks + Komponenten
export { useRevealedCandidate } from './hooks/useRevealedCandidate'
export { InterestButton } from './components/InterestButton'
export { RevealedCandidateCard } from './components/RevealedCandidateCard'

// Story 6.3: Hooks
export { useRecruiterInterests } from './hooks/useRecruiterInterests'

// Story 6.4: Hooks
export { useRecruiterBlockAction } from './hooks/useRecruiterBlockAction'

// Story 6.5: Hooks
export { useShortlistToggle } from './hooks/useShortlistToggle'
