// LebenslaufGeneratorPage — Kostenloser CV-Generator
// Route: /lebenslauf-erstellen

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

// ── Types ─────────────────────────────────────────────────────────────────────

type Experience = { id: string; position: string; firma: string; von: string; bis: string; taetigkeiten: string }
type Education  = { id: string; abschluss: string; institution: string; von: string; bis: string; hinweis: string }
type Language   = { id: string; sprache: string; niveau: string }

type CVData = {
  vorname: string; nachname: string; berufsbezeichnung: string
  email: string; telefon: string; plz: string; stadt: string; linkedin: string
  profil: string
  erfahrungen: Experience[]
  ausbildungen: Education[]
  skills: string[]
  sprachen: Language[]
  fuehrerschein: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const mkId = () => Math.random().toString(36).slice(2, 8)

const INITIAL: CVData = {
  vorname: '', nachname: '', berufsbezeichnung: '',
  email: '', telefon: '', plz: '', stadt: '', linkedin: '',
  profil: '',
  erfahrungen: [{ id: mkId(), position: '', firma: '', von: '', bis: 'heute', taetigkeiten: '' }],
  ausbildungen: [{ id: mkId(), abschluss: '', institution: '', von: '', bis: '', hinweis: '' }],
  skills: [],
  sprachen: [{ id: mkId(), sprache: 'Deutsch', niveau: 'Muttersprache' }],
  fuehrerschein: '',
}

const NIVEAUS = ['Muttersprache', 'Verhandlungssicher (C2)', 'Fließend (C1)', 'Gut (B2)', 'Grundkenntnisse (A2/B1)']

const STEPS = [
  { n: 1, label: 'Persönliche Daten' },
  { n: 2, label: 'Berufserfahrung'   },
  { n: 3, label: 'Ausbildung'        },
  { n: 4, label: 'Fähigkeiten'       },
  { n: 5, label: 'Vorschau'          },
]

// ── Global Styles ─────────────────────────────────────────────────────────────

const Styles = () => (
  <style>{`
    @media print {
      nav, .no-print { display: none !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
      .cv-page-bg { background: white !important; padding: 0 !important; min-height: unset !important; }
      .cv-grid {
        display: block !important;
        background: white !important;
        padding: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      .cv-preview-col { position: static !important; width: 100% !important; }
      .cv-paper {
        box-shadow: none !important; border-radius: 0 !important;
        margin: 0 !important; width: 100% !important;
        max-width: 100% !important; position: static !important;
      }
      @page { margin: 0; size: A4 portrait; }
    }

    .lg-input {
      width: 100%; box-sizing: border-box;
      border: 1.5px solid #e2e8f0; border-radius: 10px;
      padding: 10px 14px; font-size: 14px; font-family: ${F};
      color: #0f172a; background: #fff; outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .lg-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
    .lg-input::placeholder { color: #cbd5e1; }

    .skill-tag {
      display: inline-flex; align-items: center; gap: 5px;
      background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 20px;
      padding: 4px 12px; font-size: 13px; font-weight: 500; color: #6d28d9;
    }
    .skill-tag-remove {
      background: none; border: none; cursor: pointer; color: #a78bfa;
      font-size: 15px; line-height: 1; padding: 0; font-family: ${F};
    }
    .skill-tag-remove:hover { color: #dc2626; }

    .entry-card {
      background: #f8fafc; border: 1.5px solid #e2e8f0;
      border-radius: 14px; padding: 20px 20px 16px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .add-btn {
      border: 1.5px dashed #ddd6fe; background: #faf5ff; border-radius: 12px;
      padding: 12px; cursor: pointer; font-size: 14px; font-weight: 600;
      color: #7c3aed; font-family: ${F}; width: 100%;
      transition: background 0.15s ease;
    }
    .add-btn:hover { background: #ede9fe; }

    .nav-step-btn {
      border: none; cursor: pointer; font-family: ${F}; font-weight: 700;
      border-radius: 12px; padding: 12px 28px; font-size: 15px;
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .nav-step-btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
  `}</style>
)

// ── Reusable Fields ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder = '', type = 'text', span = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; span?: boolean
}) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: F, marginBottom: 6 }}>
        {label}
      </label>
      <input type={type} className="lg-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder = '', rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number
}) {
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: F, marginBottom: 6 }}>
        {label}
      </label>
      <textarea
        className="lg-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ resize: 'vertical', lineHeight: 1.65 }}
      />
    </div>
  )
}

// ── Step 1: Persönliche Daten ─────────────────────────────────────────────────

function Step1({ cv, set }: { cv: CVData; set: (d: CVData) => void }) {
  const u = (k: keyof CVData, v: string) => set({ ...cv, [k]: v })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Field label="Vorname *"            value={cv.vorname}           onChange={v => u('vorname', v)}           placeholder="Max"              />
      <Field label="Nachname *"           value={cv.nachname}          onChange={v => u('nachname', v)}          placeholder="Mustermann"       />
      <Field label="Berufsbezeichnung"    value={cv.berufsbezeichnung} onChange={v => u('berufsbezeichnung', v)} placeholder="Elektrotechniker" span />
      <Field label="E-Mail *"             value={cv.email}             onChange={v => u('email', v)}             placeholder="max@email.de"     type="email" />
      <Field label="Telefon"              value={cv.telefon}           onChange={v => u('telefon', v)}           placeholder="+49 176 1234 5678" />
      <Field label="Postleitzahl"         value={cv.plz}               onChange={v => u('plz', v)}               placeholder="80331"            />
      <Field label="Stadt"                value={cv.stadt}             onChange={v => u('stadt', v)}             placeholder="München"          />
      <Field label="LinkedIn (optional)"  value={cv.linkedin}          onChange={v => u('linkedin', v)}          placeholder="linkedin.com/in/max-mustermann" span />
      <Textarea
        label="Kurzes Profil (2–4 Sätze)"
        value={cv.profil}
        onChange={v => u('profil', v)}
        placeholder="Ich bin Elektrotechniker mit 8 Jahren Erfahrung in der Gebäudetechnik. Spezialisiert auf SPS-Programmierung und energieeffiziente Systeme."
        rows={3}
      />
    </div>
  )
}

// ── Step 2: Berufserfahrung ───────────────────────────────────────────────────

function Step2({ cv, set }: { cv: CVData; set: (d: CVData) => void }) {
  const upd = (id: string, k: keyof Experience, v: string) =>
    set({ ...cv, erfahrungen: cv.erfahrungen.map(e => e.id === id ? { ...e, [k]: v } : e) })
  const add = () => set({ ...cv, erfahrungen: [...cv.erfahrungen, { id: mkId(), position: '', firma: '', von: '', bis: 'heute', taetigkeiten: '' }] })
  const rem = (id: string) => set({ ...cv, erfahrungen: cv.erfahrungen.filter(e => e.id !== id) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {cv.erfahrungen.map((exp, i) => (
        <div key={exp.id} className="entry-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', fontFamily: F }}>Stelle {i + 1}</span>
            {cv.erfahrungen.length > 1 && (
              <button onClick={() => rem(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', fontFamily: F }}>
                Entfernen
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Position / Berufsbezeichnung" value={exp.position}  onChange={v => upd(exp.id, 'position', v)}  placeholder="Elektrotechniker"   />
            <Field label="Unternehmen"                  value={exp.firma}     onChange={v => upd(exp.id, 'firma', v)}     placeholder="Musterfirma GmbH"   />
            <Field label="Von (MM/JJJJ)"                value={exp.von}       onChange={v => upd(exp.id, 'von', v)}       placeholder="01/2020"            />
            <Field label="Bis (MM/JJJJ oder 'heute')"   value={exp.bis}       onChange={v => upd(exp.id, 'bis', v)}       placeholder="heute"              />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: F, marginBottom: 6 }}>
              Tätigkeiten <span style={{ fontWeight: 400, color: '#94a3b8' }}>(je Zeile eine Aufgabe)</span>
            </label>
            <textarea
              className="lg-input"
              value={exp.taetigkeiten}
              onChange={e => upd(exp.id, 'taetigkeiten', e.target.value)}
              placeholder={"Wartung und Instandhaltung von Elektroanlagen\nInstallation von Steuerungssystemen\nFehlerdiagnose und Reparatur"}
              rows={4}
              style={{ resize: 'vertical', lineHeight: 1.65 }}
            />
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={add}>+ Weitere Stelle hinzufügen</button>
    </div>
  )
}

// ── Step 3: Ausbildung ────────────────────────────────────────────────────────

function Step3({ cv, set }: { cv: CVData; set: (d: CVData) => void }) {
  const upd = (id: string, k: keyof Education, v: string) =>
    set({ ...cv, ausbildungen: cv.ausbildungen.map(e => e.id === id ? { ...e, [k]: v } : e) })
  const add = () => set({ ...cv, ausbildungen: [...cv.ausbildungen, { id: mkId(), abschluss: '', institution: '', von: '', bis: '', hinweis: '' }] })
  const rem = (id: string) => set({ ...cv, ausbildungen: cv.ausbildungen.filter(e => e.id !== id) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {cv.ausbildungen.map((edu, i) => (
        <div key={edu.id} className="entry-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', fontFamily: F }}>Ausbildung {i + 1}</span>
            {cv.ausbildungen.length > 1 && (
              <button onClick={() => rem(edu.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', fontFamily: F }}>
                Entfernen
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Abschluss / Qualifikation" value={edu.abschluss}   onChange={v => upd(edu.id, 'abschluss', v)}   placeholder="Elektrotechniker (IHK)"  />
            <Field label="Schule / Hochschule"        value={edu.institution} onChange={v => upd(edu.id, 'institution', v)} placeholder="Berufsschule München"     />
            <Field label="Von (MM/JJJJ)"              value={edu.von}         onChange={v => upd(edu.id, 'von', v)}         placeholder="09/2016"                 />
            <Field label="Bis (MM/JJJJ)"              value={edu.bis}         onChange={v => upd(edu.id, 'bis', v)}         placeholder="06/2019"                 />
          </div>
          <Textarea
            label="Hinweise (optional)"
            value={edu.hinweis}
            onChange={v => upd(edu.id, 'hinweis', v)}
            placeholder="Schwerpunkte: Automatisierungstechnik · Note: 2,1"
            rows={2}
          />
        </div>
      ))}
      <button className="add-btn" onClick={add}>+ Weitere Ausbildung hinzufügen</button>
    </div>
  )
}

// ── Step 4: Fähigkeiten ───────────────────────────────────────────────────────

function Step4({ cv, set }: { cv: CVData; set: (d: CVData) => void }) {
  const [input, setInput] = useState('')

  const addSkill = () => {
    const s = input.trim()
    if (s && !cv.skills.includes(s)) set({ ...cv, skills: [...cv.skills, s] })
    setInput('')
  }

  const updLang = (id: string, k: keyof Language, v: string) =>
    set({ ...cv, sprachen: cv.sprachen.map(l => l.id === id ? { ...l, [k]: v } : l) })
  const addLang = () => set({ ...cv, sprachen: [...cv.sprachen, { id: mkId(), sprache: '', niveau: 'Gut (B2)' }] })
  const remLang = (id: string) => set({ ...cv, sprachen: cv.sprachen.filter(l => l.id !== id) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Skills */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 4 }}>Fähigkeiten & Software</div>
        <p style={{ fontSize: 13, color: '#64748b', fontFamily: F, margin: '0 0 12px' }}>Skill eingeben → Enter oder "+" drücken</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="lg-input"
            style={{ flex: 1 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
            placeholder="z.B. SPS-Programmierung, AutoCAD, SAP PM..."
          />
          <button
            onClick={addSkill}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
          >+</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, minHeight: 32 }}>
          {cv.skills.length === 0
            ? <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: F, fontStyle: 'italic' }}>Noch keine Fähigkeiten hinzugefügt</span>
            : cv.skills.map(s => (
              <span key={s} className="skill-tag">
                {s}
                <button className="skill-tag-remove" onClick={() => set({ ...cv, skills: cv.skills.filter(x => x !== s) })}>×</button>
              </span>
            ))
          }
        </div>
      </div>

      {/* Languages */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 14 }}>Sprachkenntnisse</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cv.sprachen.map(lang => (
            <div key={lang.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="lg-input" style={{ flex: 1 }}
                value={lang.sprache} onChange={e => updLang(lang.id, 'sprache', e.target.value)}
                placeholder="Sprache"
              />
              <select
                className="lg-input" style={{ flex: 1 }}
                value={lang.niveau} onChange={e => updLang(lang.id, 'niveau', e.target.value)}
              >
                {NIVEAUS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {cv.sprachen.length > 1 && (
                <button onClick={() => remLang(lang.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', padding: '0 4px' }}>×</button>
              )}
            </div>
          ))}
          <button className="add-btn" style={{ marginTop: 4 }} onClick={addLang}>+ Sprache hinzufügen</button>
        </div>
      </div>

      {/* Driving license */}
      <div>
        <Field label="Führerschein (optional)" value={cv.fuehrerschein} onChange={v => set({ ...cv, fuehrerschein: v })} placeholder="Klasse B" />
      </div>
    </div>
  )
}

// ── CV Template ───────────────────────────────────────────────────────────────

function CVSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: '#7c3aed',
        textTransform: 'uppercase', letterSpacing: '0.12em',
        marginBottom: 8, paddingBottom: 5,
        borderBottom: '2px solid #ede9fe',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function CVPreview({ cv }: { cv: CVData }) {
  const name    = [cv.vorname, cv.nachname].filter(Boolean).join(' ') || 'Ihr Name'
  const contact = [cv.email, cv.telefon, [cv.plz, cv.stadt].filter(Boolean).join(' '), cv.linkedin].filter(Boolean)
  const hasExp  = cv.erfahrungen.some(e => e.position || e.firma)
  const hasEdu  = cv.ausbildungen.some(e => e.abschluss || e.institution)

  return (
    <div
      className="cv-paper"
      style={{
        width: '100%', background: '#fff',
        boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
        borderRadius: 8, fontFamily: F, fontSize: 13,
        color: '#0f172a', overflow: 'hidden',
      }}
    >
      {/* Header band */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)',
        padding: '32px 36px 28px',
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
          {name}
        </div>
        {cv.berufsbezeichnung && (
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 5, color: 'rgba(233,213,255,0.9)' }}>
            {cv.berufsbezeichnung}
          </div>
        )}
        {contact.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: '3px 18px', fontSize: 11.5, color: 'rgba(233,213,255,0.8)' }}>
            {contact.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '24px 36px 28px' }}>

        {cv.profil && (
          <CVSection title="Profil">
            <p style={{ margin: 0, lineHeight: 1.7, color: '#374151', fontSize: 13 }}>{cv.profil}</p>
          </CVSection>
        )}

        {hasExp && (
          <CVSection title="Berufserfahrung">
            {cv.erfahrungen.filter(e => e.position || e.firma).map(exp => (
              <div key={exp.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{exp.position || '—'}</span>
                    {exp.firma && <span style={{ color: '#7c3aed', marginLeft: 8, fontSize: 12.5 }}>{exp.firma}</span>}
                  </div>
                  {(exp.von || exp.bis) && (
                    <span style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {exp.von}{exp.von && exp.bis ? ' – ' : ''}{exp.bis}
                    </span>
                  )}
                </div>
                {exp.taetigkeiten && (
                  <ul style={{ margin: '5px 0 0', paddingLeft: 16, color: '#374151', lineHeight: 1.65, fontSize: 12.5 }}>
                    {exp.taetigkeiten.split('\n').filter(Boolean).map((t, i) => <li key={i} style={{ marginBottom: 2 }}>{t}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </CVSection>
        )}

        {hasEdu && (
          <CVSection title="Ausbildung">
            {cv.ausbildungen.filter(e => e.abschluss || e.institution).map(edu => (
              <div key={edu.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{edu.abschluss || '—'}</span>
                    {edu.institution && <span style={{ color: '#7c3aed', marginLeft: 8, fontSize: 12.5 }}>{edu.institution}</span>}
                  </div>
                  {(edu.von || edu.bis) && (
                    <span style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {edu.von}{edu.von && edu.bis ? ' – ' : ''}{edu.bis}
                    </span>
                  )}
                </div>
                {edu.hinweis && <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 12 }}>{edu.hinweis}</p>}
              </div>
            ))}
          </CVSection>
        )}

        {cv.skills.length > 0 && (
          <CVSection title="Fähigkeiten & Software">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cv.skills.map(s => (
                <span key={s} style={{
                  background: '#f5f3ff', border: '1px solid #ddd6fe',
                  borderRadius: 99, padding: '3px 11px',
                  fontSize: 11.5, fontWeight: 500, color: '#6d28d9',
                }}>{s}</span>
              ))}
            </div>
          </CVSection>
        )}

        {cv.sprachen.some(l => l.sprache) && (
          <CVSection title="Sprachen">
            {cv.sprachen.filter(l => l.sprache).map(l => (
              <div key={l.id} style={{ display: 'flex', gap: 12, marginBottom: 4, fontSize: 12.5 }}>
                <span style={{ fontWeight: 600, minWidth: 90 }}>{l.sprache}</span>
                <span style={{ color: '#64748b' }}>{l.niveau}</span>
              </div>
            ))}
          </CVSection>
        )}

        {cv.fuehrerschein && (
          <CVSection title="Führerschein">
            <span style={{ fontSize: 12.5 }}>{cv.fuehrerschein}</span>
          </CVSection>
        )}

        {!cv.profil && !hasExp && !hasEdu && cv.skills.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#cbd5e1', fontSize: 14 }}>
            Füllen Sie das Formular aus — Ihr Lebenslauf erscheint hier.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', marginBottom: 32 }}>
      {STEPS.map((s) => (
        <div
          key={s.n}
          style={{
            flex: 1, textAlign: 'center', paddingBottom: 10,
            borderBottom: `2.5px solid ${current >= s.n ? '#7c3aed' : '#e2e8f0'}`,
            transition: 'border-color 0.25s ease',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
            background: current >= s.n ? '#7c3aed' : '#f1f5f9',
            border: `2px solid ${current >= s.n ? '#7c3aed' : '#e2e8f0'}`,
            color: current >= s.n ? '#fff' : '#94a3b8',
            fontSize: 12, fontWeight: 700, fontFamily: F,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s ease',
          }}>
            {current > s.n ? '✓' : s.n}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, fontFamily: F, color: current >= s.n ? '#7c3aed' : '#94a3b8' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LebenslaufGeneratorPage() {
  const [cv, setCv] = useState<CVData>(INITIAL)
  const [step, setStep]   = useState(1)

  const handlePrint = () => {
    const cvEl = document.querySelector<HTMLElement>('.cv-paper')
    if (!cvEl) { window.print(); return }

    const win = window.open('', '_blank')
    if (!win) { window.print(); return }  // fallback if popup blocked

    win.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Lebenslauf</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: white;
           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    @page { margin: 0; size: A4 portrait; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  </style>
</head>
<body>
  ${cvEl.outerHTML}
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
    window.onafterprint = function() { window.close(); };
  <\/script>
</body>
</html>`)
    win.document.close()
  }

  const renderForm = () => {
    switch (step) {
      case 1: return <Step1 cv={cv} set={setCv} />
      case 2: return <Step2 cv={cv} set={setCv} />
      case 3: return <Step3 cv={cv} set={setCv} />
      case 4: return <Step4 cv={cv} set={setCv} />
      default: return null
    }
  }

  return (
    <>
      <Styles />
      <div className="cv-page-bg" style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: F }}>
        <PublicNav />

        {/* Hero strip */}
        <div
          className="no-print"
          style={{
            background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 60%, #7c3aed 100%)',
            padding: '80px 28px 36px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Link to="/fuer-kandidaten" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(196,181,253,0.8)', textDecoration: 'none', marginBottom: 16 }}>
              ← Zurück zur Kandidaten-Seite
            </Link>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '5px 14px', marginBottom: 12, marginLeft: 16 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(233,213,255,0.9)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                100 % kostenlos · Keine Anmeldung
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              Lebenslauf-Generator
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(196,181,253,0.85)', margin: 0, maxWidth: 480 }}>
              In wenigen Minuten zum professionellen Lebenslauf — direkt als PDF herunterladen.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="cv-grid" style={{
          maxWidth: 1200, margin: '0 auto', padding: '32px 28px 80px',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)',
          gap: 36,
          alignItems: 'start',
        }}>

          {/* ── Left: Form ── */}
          <div className="no-print">
            <div style={{
              background: '#fff', borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
              padding: '32px',
            }}>
              <StepIndicator current={step} />

              {step < 5 ? (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: F, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
                    {STEPS[step - 1].label}
                  </h2>

                  {renderForm()}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
                    {step > 1
                      ? <button className="nav-step-btn" onClick={() => setStep(s => s - 1)} style={{ background: '#f1f5f9', color: '#374151' }}>Zurück</button>
                      : <div />
                    }
                    <button
                      className="nav-step-btn"
                      onClick={() => setStep(s => s + 1)}
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                      }}
                    >
                      {step === 4 ? 'Zur Vorschau' : 'Weiter →'}
                    </button>
                  </div>
                </>
              ) : (
                /* Step 5: Done screen */
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ marginBottom: 16, color: '#7c3aed' }}>
                    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', fontFamily: F, marginBottom: 8 }}>
                    Ihr Lebenslauf ist fertig!
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, lineHeight: 1.7, marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
                    Klicken Sie auf "PDF herunterladen". Im Browser-Druckdialog wählen Sie <strong>"Als PDF speichern"</strong>.
                  </p>
                  <button
                    onClick={handlePrint}
                    style={{
                      width: '100%', border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      color: '#fff', borderRadius: 12, padding: '14px',
                      fontSize: 15, fontWeight: 700, fontFamily: F,
                      boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
                      marginBottom: 12,
                    }}
                  >
                    PDF herunterladen
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    style={{
                      width: '100%', border: '1.5px solid #e2e8f0', cursor: 'pointer',
                      background: '#f8fafc', color: '#374151', borderRadius: 12, padding: '12px',
                      fontSize: 14, fontWeight: 600, fontFamily: F,
                    }}
                  >
                    Bearbeiten
                  </button>

                  {/* Hint to upload to profile */}
                  <div style={{
                    marginTop: 28, padding: '16px 18px',
                    background: '#f5f3ff', border: '1px solid #ddd6fe',
                    borderRadius: 12, textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6d28d9', fontFamily: F, marginBottom: 4 }}>
                      Tipp: Profil auf pheweb anlegen
                    </div>
                    <p style={{ fontSize: 12.5, color: '#64748b', fontFamily: F, margin: '0 0 12px', lineHeight: 1.65 }}>
                      Laden Sie Ihren Lebenslauf in Ihr pheweb-Profil hoch und werden Sie von Unternehmen aus Elektro, TGA, SHK & Mechatronik gefunden.
                    </p>
                    <Link
                      to="/kandidat/anfrage"
                      style={{
                        display: 'inline-block', fontSize: 13, fontWeight: 700,
                        color: '#fff', textDecoration: 'none',
                        background: '#7c3aed', borderRadius: 8, padding: '8px 16px',
                      }}
                    >
                      Jetzt Profil erstellen →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="cv-preview-col" style={{ position: 'sticky', top: 88 }}>
            <div
              className="no-print"
              style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}
            >
              Live-Vorschau
            </div>
            <CVPreview cv={cv} />
          </div>

        </div>
      </div>
    </>
  )
}
