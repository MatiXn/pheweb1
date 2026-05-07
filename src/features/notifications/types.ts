// Notification-Feature Typen — Story 5.2/5.3: Match-Benachrichtigung

// ── Match-Benachrichtigungs-Status ──────────────────────────────────────────

export interface MatchNotificationStatus {
  matchId: string
  jobId: string
  companyNotifiedAt: string | null    // ISO timestamp, null = ausstehend
  candidateNotifiedAt: string | null  // ISO timestamp, null = ausstehend (Story 5.3)
}

// ── Audit-Log-Einträge für E-Mail-Events ────────────────────────────────────

export type EmailAuditAction =
  | 'email.match_notification.sent'
  | 'email.candidate_match_notification.sent'  // Story 5.3
  | 'email.welcome_sequence.sent'              // Story 5.5

export interface EmailAuditMetadata {
  match_count?: number
  recipients?: number
  match_ids?: string[]
  job_id?: string
  candidate_id?: string
}
