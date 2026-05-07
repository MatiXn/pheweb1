import type { SkillItem, skill_category } from '../types'
import { SKILL_CATEGORY_LABELS, HARD_SKILL_CATEGORIES, SOFT_SKILL_CATEGORY } from '../types'

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// P5: fixed display order — categories always appear in this sequence regardless of skill names
const ORDERED_CATEGORIES: skill_category[] = [...HARD_SKILL_CATEGORIES, SOFT_SKILL_CATEGORY]

export interface SkillsSelectorProps {
  /** Pre-geladene Skills vom Parent (via useSkillsTaxonomy oder useOnboarding) */
  skills: SkillItem[]
  /** Kontrollierte Selektion */
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function SkillsSelector({ skills, selectedIds, onChange, disabled = false }: SkillsSelectorProps) {
  if (skills.length === 0) {
    return (
      <p style={{ fontFamily: F, fontSize: 13, color: C.faint }}>
        Keine Skills verfügbar.
      </p>
    )
  }

  // Gruppiere nach Kategorie
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    const key = skill.category
    if (!acc[key]) acc[key] = []
    acc[key].push(skill)
    return acc
  }, {})

  const handleToggle = (skillId: string) => {
    if (disabled) return
    if (selectedIds.includes(skillId)) {
      onChange(selectedIds.filter(id => id !== skillId))
    } else {
      onChange([...selectedIds, skillId])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* P5: iterate fixed category order, skip empty categories */}
      {ORDERED_CATEGORIES.filter(cat => (grouped[cat] ?? []).length > 0).map(category => (
        <div key={category}>
          <p style={{
            fontFamily: F, fontSize: 11, fontWeight: 700,
            color: C.faint, textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: 10,
          }}>
            {SKILL_CATEGORY_LABELS[category] ?? category}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {grouped[category].map(skill => {
              const isSelected = selectedIds.includes(skill.id)
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={isSelected}  // P8: screen readers can determine selected state
                  onClick={() => handleToggle(skill.id)}
                  disabled={disabled}
                  style={{
                    fontFamily: F,
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1.5px solid ${isSelected ? C.accentDk : C.border}`,
                    background: isSelected ? C.accent : '#f5f7fa',
                    color: isSelected ? '#fff' : C.text,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                >
                  {skill.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
