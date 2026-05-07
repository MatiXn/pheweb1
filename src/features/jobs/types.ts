import type { Database } from '../../types/database'

export type skill_category = Database['public']['Enums']['skill_category']

export interface SkillItem {
  id: string
  name: string
  category: skill_category
  is_active: boolean
}

/** Hard Skill categories (alle außer 'it') */
export const HARD_SKILL_CATEGORIES: skill_category[] = [
  'elektrotechnik',
  'tga',
  'shk',
  'mechatronik',
  'sonstiges',
]

/** Soft Skill category */
export const SOFT_SKILL_CATEGORY: skill_category = 'it'

/** Display labels für alle Kategorien */
export const SKILL_CATEGORY_LABELS: Record<skill_category, string> = {
  elektrotechnik: 'Elektrotechnik',
  tga: 'TGA',
  shk: 'SHK',
  mechatronik: 'Mechatronik',
  it: 'Soft Skills / IT',
  sonstiges: 'Sonstiges',
}

/**
 * Mapping von Berufsfeld-String (Onboarding-Auswahl) auf skill_category.
 * Exportiert für künftige Konsolidierung mit useOnboarding / useProfileEdit.
 * NICHT in dieser Story refaktorieren.
 */
export const BERUFSFELD_TO_CATEGORY: Record<string, skill_category> = {
  Elektrotechnik: 'elektrotechnik',
  TGA: 'tga',
  SHK: 'shk',
  Mechatronik: 'mechatronik',
  Kältetechnik: 'sonstiges',
  SPS: 'elektrotechnik',
}
