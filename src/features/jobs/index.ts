// Public API des jobs-Features
export type { SkillItem, skill_category } from './types'
export {
  HARD_SKILL_CATEGORIES,
  SOFT_SKILL_CATEGORY,
  SKILL_CATEGORY_LABELS,
  BERUFSFELD_TO_CATEGORY,
} from './types'
export type { UseSkillsTaxonomyOptions, UseSkillsTaxonomyReturn } from './hooks/useSkillsTaxonomy'
export { useSkillsTaxonomy } from './hooks/useSkillsTaxonomy'
export type { SkillsSelectorProps } from './components/SkillsSelector'
export { SkillsSelector } from './components/SkillsSelector'
