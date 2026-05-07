// Domain-Typen für die gesamte Anwendung
// NICHT auto-generiert — manuell gepflegt

export type UserRole = 'kandidat' | 'unternehmen' | 'recruiter' | 'admin';

export type MatchStatus =
  | 'ausstehend'
  | 'angesehen'
  | 'interessiert'
  | 'abgelehnt'
  | 'kontakt_hergestellt'
  | 'eingestellt'
  | 'nicht_eingestellt'
  | 'pausiert'
  | 'kandidat_nicht_verfügbar';

export type SkillCategory =
  | 'elektrotechnik'
  | 'tga'
  | 'shk'
  | 'mechatronik'
  | 'it'
  | 'sonstiges';

export type JobListingStatus = 'aktiv' | 'pausiert' | 'geschlossen';

export type DocumentType =
  | 'lebenslauf'
  | 'zeugnis'
  | 'zertifikat'
  | 'sonstiges';

export type SubscriptionTier = 'basis' | 'professional' | 'enterprise';

export type SubscriptionStatus =
  | 'aktiv'
  | 'ablaufend'
  | 'abgelaufen'
  | 'eingefroren';
