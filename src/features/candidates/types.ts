// Feature-spezifische Typen für das Kandidaten-Feature

export interface WizardStep1Data {
  jobField: string
}

export interface WizardStep2Data {
  skillIds: string[]
}

export interface WizardStep3Data {
  desiredLocationState: string
  radiusKm: number
  salaryExpectation: number
}

export interface Skill {
  id: string
  name: string
  category: string
}

export interface WizardStep4Data {
  availabilityStatus: 'sofort' | 'ab_datum' | 'nicht_verfuegbar'
  availableFrom?: string
  softSkillIds: string[]
  emailMatchAlerts: boolean
  emailInterestAlerts: boolean
}

export interface OnboardingWizardProps {
  initialStep?: number
  initialJobField?: string
  onComplete?: () => void
}

// Story 3.3: Dokumenten-Upload
export type DocumentType = 'lebenslauf' | 'zeugnis' | 'zertifikat' | 'sonstiges'

// Story 3.4: DSGVO-Einwilligung
export type ProfileStatus =
  | 'entwurf'
  | 'ausstehend_verifizierung'
  | 'aktiv'
  | 'abgelehnt'
  | 'gesperrt'

export interface UploadedDocument {
  id: string
  documentType: DocumentType
  originalFilename: string | null
  fileSizeBytes: number | null
  verified: boolean
  verifiedAt: string | null
  createdAt: string
  storagePath: string
}
