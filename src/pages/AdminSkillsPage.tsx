import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useSkillsTaxonomy } from '../features/jobs/hooks/useSkillsTaxonomy'
import {
  HARD_SKILL_CATEGORIES,
  SOFT_SKILL_CATEGORY,
  SKILL_CATEGORY_LABELS,
} from '../features/jobs/types'
import type { skill_category } from '../features/jobs/types'
import { AppShell } from '../components/AppShell'

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff', accentBd: 'rgba(59,114,184,0.18)',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4', red: '#dc2626', redBg: '#fef2f2',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: C.faint,
  display: 'block', marginBottom: 6, fontFamily: F,
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#f5f7fa',
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: '10px 14px', fontSize: 14, color: C.text,
  outline: 'none', fontFamily: F, boxSizing: 'border-box',
}

const ALL_CATEGORIES: skill_category[] = [...HARD_SKILL_CATEGORIES, SOFT_SKILL_CATEGORY]

export default function AdminSkillsPage() {
  const { profile, isLoading: userLoading } = useCurrentUser()
  const { skills, isLoading, error, loadSkills, addSkill, setSkillActive } = useSkillsTaxonomy()

  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<skill_category | ''>('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  // P3: track in-flight toggle per skill to prevent concurrent double-clicks
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadSkills({ includeInactive: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.role])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg)
    setToastType(type)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  // Zugriffsprüfung nach User-Load
  if (userLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  const handleAddSkill = async () => {
    setValidationError(null)
    if (!newName.trim()) {
      setValidationError('Name ist erforderlich.')
      return
    }
    if (newName.trim().length > 100) {
      setValidationError('Name darf maximal 100 Zeichen haben.')
      return
    }
    if (!newCategory) {
      setValidationError('Bitte wählen Sie eine Kategorie aus.')
      return
    }

    setIsAdding(true)
    const errMsg = await addSkill(newName.trim(), newCategory)
    setIsAdding(false)

    if (errMsg) {
      // P7: duplicate constraint error shown inline, not as toast
      if (errMsg === 'Ein Skill mit diesem Namen existiert bereits.') {
        setValidationError(errMsg)
      } else {
        showToast(errMsg, 'error')
      }
    } else {
      setNewName('')
      setNewCategory('')
      showToast('Skill hinzugefügt')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    // P3: disable button for this skill during async call
    setTogglingIds(prev => new Set(prev).add(id))
    const errMsg = await setSkillActive(id, !currentActive)
    setTogglingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    if (errMsg) {
      showToast(errMsg, 'error')
    } else {
      showToast(currentActive ? 'Skill deaktiviert' : 'Skill reaktiviert')
    }
  }

  // Gruppiere Skills nach Kategorie
  const skillsByCategory = ALL_CATEGORIES.reduce<Record<skill_category, typeof skills>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat)
    return acc
  }, {} as Record<skill_category, typeof skills>)

  const hardSkills = HARD_SKILL_CATEGORIES.flatMap(cat => skillsByCategory[cat])
  const softSkills = skillsByCategory[SOFT_SKILL_CATEGORY]

  return (
    <AppShell maxWidth={900}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toastType === 'success' ? C.greenBg : C.redBg,
          border: `1.5px solid ${toastType === 'success' ? '#86efac' : '#fecaca'}`,
          color: toastType === 'success' ? C.green : C.red,
          borderRadius: 12, padding: '12px 20px',
          fontFamily: F, fontSize: 14, fontWeight: 600,
          boxShadow: C.shadowMd,
        }}>
          {toastType === 'success' ? '✓ ' : '✕ '}{toast}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Skills-Verwaltung
        </h1>
        <p style={{ fontFamily: F, fontSize: 14, color: '#94a3b8', margin: 0 }}>
          Verwalten Sie die normierte Skills-Taxonomie der Plattform.
        </p>
      </div>

        {/* Add Form */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
          padding: '24px 28px', marginBottom: 32,
        }}>
          <h2 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>
            Neuen Skill hinzufügen
          </h2>

          {validationError && (
            <div style={{
              background: C.redBg, border: '1.5px solid #fecaca',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              fontFamily: F, fontSize: 14, color: C.red,
            }}>
              {validationError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <label style={labelStyle}>Skill-Name *</label>
              <input
                style={inputStyle}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="z.B. AutoCAD, Schweißen, Projektmanagement"
                maxLength={100}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSkill() }}
              />
            </div>
            <div>
              <label style={labelStyle}>Kategorie *</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as skill_category)}
              >
                <option value="">Wählen...</option>
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{SKILL_CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddSkill}
              disabled={isAdding}
              style={{
                background: isAdding ? C.accentBg : C.accent,
                color: isAdding ? C.accent : '#fff',
                border: 'none', borderRadius: 12,
                padding: '10px 20px', fontSize: 14, fontWeight: 700,
                cursor: isAdding ? 'not-allowed' : 'pointer',
                fontFamily: F, whiteSpace: 'nowrap',
                height: 42, alignSelf: 'flex-end',
              }}
            >
              {isAdding ? '...' : '+ Hinzufügen'}
            </button>
          </div>
        </div>

        {/* Skills List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: 36, height: 36, border: `3px solid ${C.accentBg}`,
              borderTop: `3px solid ${C.accent}`, borderRadius: '50%',
              margin: '0 auto 12px', animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Skills werden geladen...</p>
          </div>
        ) : error ? (
          <div style={{
            background: C.redBg, border: '1.5px solid #fecaca',
            borderRadius: 12, padding: '16px 20px',
            fontFamily: F, fontSize: 14, color: C.red,
          }}>
            {error}
          </div>
        ) : (
          <>
            {/* Hard Skills Section */}
            <SkillSection
              title="Hard Skills"
              skillsByCategory={skillsByCategory}
              categories={HARD_SKILL_CATEGORIES}
              onToggleActive={handleToggleActive}
              togglingIds={togglingIds}
            />

            {/* Soft Skills Section */}
            <SkillSection
              title="Soft Skills"
              skillsByCategory={skillsByCategory}
              categories={[SOFT_SKILL_CATEGORY]}
              onToggleActive={handleToggleActive}
              togglingIds={togglingIds}
            />

            {hardSkills.length === 0 && softSkills.length === 0 && (
              <p style={{ fontFamily: F, fontSize: 14, color: C.faint, textAlign: 'center', padding: '32px 0' }}>
                Noch keine Skills vorhanden.
              </p>
            )}
          </>
        )}
    </AppShell>
  )
}

interface SkillSectionProps {
  title: string
  skillsByCategory: Record<skill_category, ReturnType<typeof useSkillsTaxonomy>['skills']>
  categories: skill_category[]
  onToggleActive: (id: string, currentActive: boolean) => Promise<void>
  togglingIds: Set<string>  // P3: which skills are currently being toggled
}

function SkillSection({ title, skillsByCategory, categories, onToggleActive, togglingIds }: SkillSectionProps) {
  const totalCount = categories.reduce((sum, cat) => sum + skillsByCategory[cat].length, 0)
  if (totalCount === 0) return null

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
      padding: '24px 28px', marginBottom: 24,
    }}>
      <h2 style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 20 }}>
        {title}
        <span style={{ fontWeight: 400, color: C.faint, fontSize: 13, marginLeft: 8 }}>
          ({totalCount})
        </span>
      </h2>

      {categories.map(cat => {
        const catSkills = skillsByCategory[cat]
        if (catSkills.length === 0) return null
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: F, fontSize: 11, fontWeight: 700, color: C.faint,
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
            }}>
              {SKILL_CATEGORY_LABELS[cat]}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {catSkills.map(skill => (
                <div key={skill.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', borderRadius: 10,
                  background: skill.is_active ? '#f8fafc' : '#f1f5f9',
                  border: `1px solid ${C.border}`,
                  opacity: skill.is_active ? 1 : 0.65,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: F, fontSize: 14, color: C.text,
                      textDecoration: skill.is_active ? 'none' : 'line-through',
                    }}>
                      {skill.name}
                    </span>
                    {/* P12: AC1 — category label per skill */}
                    <span style={{
                      fontFamily: F, fontSize: 11, color: C.faint,
                      background: C.accentBg, borderRadius: 4,
                      padding: '2px 6px',
                    }}>
                      {SKILL_CATEGORY_LABELS[skill.category]}
                    </span>
                  </div>
                  <button
                    type="button"  // P10: explicit type prevents accidental form submit
                    onClick={() => onToggleActive(skill.id, skill.is_active)}
                    disabled={togglingIds.has(skill.id)}  // P3: disable during in-flight toggle
                    style={{
                      fontFamily: F, fontSize: 12, fontWeight: 600,
                      padding: '4px 12px', borderRadius: 8,
                      cursor: togglingIds.has(skill.id) ? 'not-allowed' : 'pointer',
                      border: `1px solid ${skill.is_active ? '#fecaca' : '#86efac'}`,
                      background: skill.is_active ? C.redBg : C.greenBg,
                      color: skill.is_active ? C.red : C.green,
                      opacity: togglingIds.has(skill.id) ? 0.5 : 1,
                    }}
                  >
                    {skill.is_active ? 'Deaktivieren' : 'Reaktivieren'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
