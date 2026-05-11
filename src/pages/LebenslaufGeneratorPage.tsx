// LebenslaufGeneratorPage — Kostenloser CV-Generator
// Route: /lebenslauf-erstellen

import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

// ── Types ─────────────────────────────────────────────────────────────────────

type Experience = { id: string; position: string; firma: string; ort: string; von: string; bis: string; taetigkeiten: string }
type Education  = { id: string; abschluss: string; institution: string; ort: string; von: string; bis: string; hinweis: string }
type Language   = { id: string; sprache: string; niveau: string }
type Template   = 'A' | 'B' | 'C'

type CVData = {
  vorname: string; nachname: string; berufsbezeichnung: string
  email: string; telefon: string; strasse: string; plz: string; stadt: string; linkedin: string
  foto: string
  profil: string
  erfahrungen: Experience[]
  ausbildungen: Education[]
  skills: string[]
  bescheinigungen: string[]
  sprachen: Language[]
  fuehrerschein: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const mkId = () => Math.random().toString(36).slice(2, 8)

const INITIAL: CVData = {
  vorname: '', nachname: '', berufsbezeichnung: '',
  email: '', telefon: '', strasse: '', plz: '', stadt: '', linkedin: '',
  foto: '',
  profil: '',
  erfahrungen: [{ id: mkId(), position: '', firma: '', ort: '', von: '', bis: 'heute', taetigkeiten: '' }],
  ausbildungen: [{ id: mkId(), abschluss: '', institution: '', ort: '', von: '', bis: '', hinweis: '' }],
  skills: [],
  bescheinigungen: [],
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
      .cv-grid { display: block !important; background: white !important; padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
      .cv-preview-col { position: static !important; width: 100% !important; }
      .cv-paper { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; position: static !important; }
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

    .tmpl-btn {
      border: 2px solid #e2e8f0; background: #fff; border-radius: 10px;
      padding: 8px 14px; cursor: pointer; font-family: ${F}; font-size: 12px;
      font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 7px;
      transition: all 0.15s ease; flex: 1; justify-content: center;
    }
    .tmpl-btn:hover { border-color: #a78bfa; color: #7c3aed; }
    .tmpl-btn.active { border-color: #7c3aed; background: #f5f3ff; color: #7c3aed; }
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

// ── Photo Upload ───────────────────────────────────────────────────────────────

function PhotoUpload({ foto, onChange }: { foto: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 20, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0' }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: 76, height: 76, borderRadius: '50%',
          background: foto ? 'transparent' : '#f1f5f9',
          border: '2px dashed #ddd6fe', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}
      >
        {foto
          ? <img src={foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Foto" />
          : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
        }
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 3 }}>
          Profilfoto{' '}
          {foto
            ? <span style={{ color: '#10b981', fontWeight: 500, fontSize: 13 }}>hochgeladen</span>
            : <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>(optional)</span>
          }
        </div>
        <p style={{ fontSize: 12.5, color: '#64748b', fontFamily: F, margin: '0 0 10px', lineHeight: 1.5 }}>
          Quadratisches Foto empfohlen · JPG oder PNG
        </p>
        <button type="button" onClick={() => inputRef.current?.click()}
          style={{ border: '1.5px solid #ddd6fe', background: '#faf5ff', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#7c3aed', cursor: 'pointer', fontFamily: F }}>
          {foto ? 'Foto ändern' : 'Foto hochladen'}
        </button>
        {foto && (
          <button type="button" onClick={() => onChange('')}
            style={{ marginLeft: 8, border: 'none', background: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer', fontFamily: F }}>
            Entfernen
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

// ── Step 1: Persönliche Daten ─────────────────────────────────────────────────

function Step1({ cv, set }: { cv: CVData; set: (d: CVData) => void }) {
  const u = (k: keyof CVData, v: string) => set({ ...cv, [k]: v })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <PhotoUpload foto={cv.foto} onChange={v => u('foto', v)} />
      <Field label="Vorname *"           value={cv.vorname}           onChange={v => u('vorname', v)}           placeholder="Kim"                />
      <Field label="Nachname *"          value={cv.nachname}          onChange={v => u('nachname', v)}          placeholder="Mustermann"         />
      <Field label="Berufsbezeichnung"   value={cv.berufsbezeichnung} onChange={v => u('berufsbezeichnung', v)} placeholder="Elektrotechniker"   span />
      <Field label="E-Mail *"            value={cv.email}             onChange={v => u('email', v)}             placeholder="kim@email.de"       type="email" />
      <Field label="Telefon"             value={cv.telefon}           onChange={v => u('telefon', v)}           placeholder="+49 176 1234 5678"  />
      <Field label="Straße & Hausnummer" value={cv.strasse}           onChange={v => u('strasse', v)}           placeholder="Musterstraße 12"    span />
      <Field label="Postleitzahl"        value={cv.plz}               onChange={v => u('plz', v)}               placeholder="80331"              />
      <Field label="Stadt"               value={cv.stadt}             onChange={v => u('stadt', v)}             placeholder="München"            />
      <Field label="LinkedIn (optional)" value={cv.linkedin}          onChange={v => u('linkedin', v)}          placeholder="linkedin.com/in/…"  span />
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
  const add = () => set({ ...cv, erfahrungen: [...cv.erfahrungen, { id: mkId(), position: '', firma: '', ort: '', von: '', bis: 'heute', taetigkeiten: '' }] })
  const rem = (id: string) => set({ ...cv, erfahrungen: cv.erfahrungen.filter(e => e.id !== id) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {cv.erfahrungen.map((exp, i) => (
        <div key={exp.id} className="entry-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', fontFamily: F }}>Stelle {i + 1}</span>
            {cv.erfahrungen.length > 1 && (
              <button onClick={() => rem(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', fontFamily: F }}>Entfernen</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Position / Berufsbezeichnung" value={exp.position} onChange={v => upd(exp.id, 'position', v)} placeholder="Elektrotechniker"  />
            <Field label="Unternehmen"                  value={exp.firma}    onChange={v => upd(exp.id, 'firma', v)}    placeholder="Musterfirma GmbH"  />
            <Field label="Ort"                          value={exp.ort}      onChange={v => upd(exp.id, 'ort', v)}      placeholder="Berlin"            />
            <div />
            <Field label="Von (MM/JJJJ)"                value={exp.von}      onChange={v => upd(exp.id, 'von', v)}      placeholder="01/2020"           />
            <Field label="Bis"                          value={exp.bis}      onChange={v => upd(exp.id, 'bis', v)}      placeholder="heute"             />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: F, marginBottom: 6 }}>
              Tätigkeiten <span style={{ fontWeight: 400, color: '#94a3b8' }}>(je Zeile eine Aufgabe)</span>
            </label>
            <textarea className="lg-input" value={exp.taetigkeiten} onChange={e => upd(exp.id, 'taetigkeiten', e.target.value)}
              placeholder={"Wartung und Instandhaltung von Elektroanlagen\nInstallation von Steuerungssystemen\nFehlerdiagnose und Reparatur"}
              rows={4} style={{ resize: 'vertical', lineHeight: 1.65 }} />
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
  const add = () => set({ ...cv, ausbildungen: [...cv.ausbildungen, { id: mkId(), abschluss: '', institution: '', ort: '', von: '', bis: '', hinweis: '' }] })
  const rem = (id: string) => set({ ...cv, ausbildungen: cv.ausbildungen.filter(e => e.id !== id) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {cv.ausbildungen.map((edu, i) => (
        <div key={edu.id} className="entry-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', fontFamily: F }}>Ausbildung {i + 1}</span>
            {cv.ausbildungen.length > 1 && (
              <button onClick={() => rem(edu.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', fontFamily: F }}>Entfernen</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Abschluss / Qualifikation" value={edu.abschluss}   onChange={v => upd(edu.id, 'abschluss', v)}   placeholder="Elektrotechniker (IHK)" />
            <Field label="Schule / Hochschule"        value={edu.institution} onChange={v => upd(edu.id, 'institution', v)} placeholder="Berufsschule München"    />
            <Field label="Ort"                        value={edu.ort}         onChange={v => upd(edu.id, 'ort', v)}         placeholder="München"                 />
            <div />
            <Field label="Von (MM/JJJJ)"              value={edu.von}         onChange={v => upd(edu.id, 'von', v)}         placeholder="09/2016"                 />
            <Field label="Bis (MM/JJJJ)"              value={edu.bis}         onChange={v => upd(edu.id, 'bis', v)}         placeholder="06/2019"                 />
          </div>
          <Textarea label="Hinweise (optional)" value={edu.hinweis} onChange={v => upd(edu.id, 'hinweis', v)}
            placeholder="Schwerpunkte: Automatisierungstechnik · Note: 2,1" rows={2} />
        </div>
      ))}
      <button className="add-btn" onClick={add}>+ Weitere Ausbildung hinzufügen</button>
    </div>
  )
}

// ── Step 4: Fähigkeiten & Bescheinigungen ─────────────────────────────────────

function Step4({ cv, set }: { cv: CVData; set: (d: CVData) => void }) {
  const [skillInput, setSkillInput] = useState('')
  const [beschInput, setBeschInput] = useState('')

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !cv.skills.includes(s)) set({ ...cv, skills: [...cv.skills, s] })
    setSkillInput('')
  }
  const addBesch = () => {
    const s = beschInput.trim()
    if (s && !cv.bescheinigungen.includes(s)) set({ ...cv, bescheinigungen: [...cv.bescheinigungen, s] })
    setBeschInput('')
  }

  const updLang = (id: string, k: keyof Language, v: string) =>
    set({ ...cv, sprachen: cv.sprachen.map(l => l.id === id ? { ...l, [k]: v } : l) })
  const addLang = () => set({ ...cv, sprachen: [...cv.sprachen, { id: mkId(), sprache: '', niveau: 'Gut (B2)' }] })
  const remLang = (id: string) => set({ ...cv, sprachen: cv.sprachen.filter(l => l.id !== id) })

  const TagRow = ({ items, onRemove, color }: { items: string[]; onRemove: (s: string) => void; color?: string }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, minHeight: 32 }}>
      {items.length === 0
        ? <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: F, fontStyle: 'italic' }}>Noch keine eingetragen</span>
        : items.map(s => (
          <span key={s} className="skill-tag" style={color ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } : undefined}>
            {s}
            <button className="skill-tag-remove" style={color ? { color: '#86efac' } : undefined} onClick={() => onRemove(s)}>×</button>
          </span>
        ))
      }
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Skills */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 4 }}>Fähigkeiten & Software</div>
        <p style={{ fontSize: 13, color: '#64748b', fontFamily: F, margin: '0 0 12px' }}>Skill eingeben → Enter oder "+" drücken</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="lg-input" style={{ flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
            placeholder="z.B. SPS-Programmierung, AutoCAD, SAP PM…" />
          <button onClick={addSkill} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
        </div>
        <TagRow items={cv.skills} onRemove={s => set({ ...cv, skills: cv.skills.filter(x => x !== s) })} />
      </div>

      {/* Bescheinigungen */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 4 }}>Zertifikate & Bescheinigungen</div>
        <p style={{ fontSize: 13, color: '#64748b', fontFamily: F, margin: '0 0 12px' }}>z.B. "Zertifizierter Brandschutzbeauftragter (IHK)"</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="lg-input" style={{ flex: 1 }} value={beschInput} onChange={e => setBeschInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBesch() } }}
            placeholder="Zertifikat eingeben…" />
          <button onClick={addBesch} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
        </div>
        <TagRow items={cv.bescheinigungen} onRemove={s => set({ ...cv, bescheinigungen: cv.bescheinigungen.filter(x => x !== s) })} color="green" />
      </div>

      {/* Sprachen */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 14 }}>Sprachkenntnisse</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cv.sprachen.map(lang => (
            <div key={lang.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="lg-input" style={{ flex: 1 }} value={lang.sprache}
                onChange={e => updLang(lang.id, 'sprache', e.target.value)} placeholder="Sprache" />
              <select className="lg-input" style={{ flex: 1 }} value={lang.niveau}
                onChange={e => updLang(lang.id, 'niveau', e.target.value)}>
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

      {/* Führerschein */}
      <Field label="Führerschein (optional)" value={cv.fuehrerschein}
        onChange={v => set({ ...cv, fuehrerschein: v })} placeholder="Klasse B" />
    </div>
  )
}

// ── Template A: Zwei-Spalten Klassisch ────────────────────────────────────────

function SidebarLabel({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7, marginTop: 16 }}>
      <div style={{ width: 3, height: 13, background: '#1e3a8a', borderRadius: 2, flexShrink: 0 }} />
      <div style={{ fontSize: 9, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F }}>
        {title}
      </div>
    </div>
  )
}

function MainLabel({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, marginTop: 14 }}>
      <div style={{ width: 3, height: 13, background: '#1e3a8a', borderRadius: 2, flexShrink: 0 }} />
      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F }}>
        {title}
      </div>
    </div>
  )
}

function TemplateA({ cv }: { cv: CVData }) {
  const name    = `${cv.vorname.toUpperCase()} ${cv.nachname.toUpperCase()}`.trim() || 'IHR NAME'
  const adresse = [cv.strasse, [cv.plz, cv.stadt].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const hasExp  = cv.erfahrungen.some(e => e.position || e.firma)
  const hasEdu  = cv.ausbildungen.some(e => e.abschluss || e.institution)

  return (
    <div style={{ display: 'flex', fontFamily: F, fontSize: 12, color: '#0f172a', minHeight: 800 }}>

      {/* ── Sidebar ── */}
      <div style={{ width: '32%', background: '#f2f4f8', padding: '28px 16px 28px 18px', flexShrink: 0 }}>

        {cv.foto ? (
          <img src={cv.foto} alt="Foto"
            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, display: 'block', marginBottom: 4 }} />
        ) : (
          <div style={{ width: '100%', aspectRatio: '1', background: '#dde3ee', borderRadius: 6, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}

        {(cv.email || cv.telefon || adresse) && (
          <>
            <SidebarLabel title="Kontakt" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cv.email   && <div><div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>E-Mail</div><div style={{ fontSize: 10.5, color: '#1e293b', wordBreak: 'break-all' }}>{cv.email}</div></div>}
              {cv.telefon && <div><div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Telefon</div><div style={{ fontSize: 10.5, color: '#1e293b' }}>{cv.telefon}</div></div>}
              {adresse    && <div><div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Adresse</div><div style={{ fontSize: 10.5, color: '#1e293b', lineHeight: 1.5 }}>{adresse}</div></div>}
              {cv.linkedin && <div><div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>LinkedIn</div><div style={{ fontSize: 10.5, color: '#1e40af', wordBreak: 'break-all' }}>{cv.linkedin}</div></div>}
            </div>
          </>
        )}

        {cv.fuehrerschein && (
          <>
            <SidebarLabel title="Führerscheine" />
            <div style={{ fontSize: 11, color: '#1e293b' }}>{cv.fuehrerschein}</div>
          </>
        )}

        {cv.skills.length > 0 && (
          <>
            <SidebarLabel title="Fähigkeiten" />
            <ul style={{ margin: 0, paddingLeft: 13, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {cv.skills.map(s => <li key={s} style={{ fontSize: 10.5, color: '#1e293b' }}>{s}</li>)}
            </ul>
          </>
        )}

        {cv.sprachen.some(l => l.sprache) && (
          <>
            <SidebarLabel title="Sprachen" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cv.sprachen.filter(l => l.sprache).map(l => (
                <div key={l.id}>
                  <span style={{ fontWeight: 700, fontSize: 10.5 }}>{l.sprache}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}> – {l.niveau}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: '28px 24px 28px 24px', background: '#fff' }}>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {name}
          </div>
          {cv.berufsbezeichnung && (
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 5 }}>
              {cv.berufsbezeichnung}
            </div>
          )}
        </div>

        {cv.profil && (
          <>
            <MainLabel title="Profil" />
            <p style={{ margin: '0 0 4px', lineHeight: 1.7, color: '#374151', fontSize: 11 }}>{cv.profil}</p>
          </>
        )}

        {hasExp && (
          <>
            <MainLabel title="Berufserfahrung" />
            {cv.erfahrungen.filter(e => e.position || e.firma).map(exp => (
              <div key={exp.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 11.5 }}>{exp.position || '—'}</span>
                  {(exp.von || exp.bis) && (
                    <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {[exp.von, exp.bis].filter(Boolean).join(' – ')}
                    </span>
                  )}
                </div>
                {(exp.firma || exp.ort) && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', marginTop: 1 }}>
                    {[exp.firma, exp.ort].filter(Boolean).join(' – ')}
                  </div>
                )}
                {exp.taetigkeiten && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: 14, color: '#374151', lineHeight: 1.6, fontSize: 10.5 }}>
                    {exp.taetigkeiten.split('\n').filter(Boolean).map((t, i) => <li key={i} style={{ marginBottom: 1 }}>{t}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {hasEdu && (
          <>
            <MainLabel title="Ausbildung" />
            {cv.ausbildungen.filter(e => e.abschluss || e.institution).map(edu => (
              <div key={edu.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 11.5 }}>{edu.abschluss || '—'}</span>
                  {(edu.von || edu.bis) && (
                    <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {[edu.von, edu.bis].filter(Boolean).join(' – ')}
                    </span>
                  )}
                </div>
                {(edu.institution || edu.ort) && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', marginTop: 1 }}>
                    {[edu.institution, edu.ort].filter(Boolean).join(', ')}
                  </div>
                )}
                {edu.hinweis && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 10 }}>{edu.hinweis}</p>}
              </div>
            ))}
          </>
        )}

        {cv.bescheinigungen.length > 0 && (
          <>
            <MainLabel title="Bescheinigungen" />
            {cv.bescheinigungen.map((b, i) => (
              <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 3 }}>{b}</div>
            ))}
          </>
        )}

        {(!cv.profil && !hasExp && !hasEdu && cv.bescheinigungen.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#cbd5e1', fontSize: 13 }}>
            Füllen Sie das Formular aus — Ihr Lebenslauf erscheint hier.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Template B: Ein-Spalten Modern ────────────────────────────────────────────

function ModernLabel({ title }: { title: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, color: '#0f172a',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 10, marginTop: 18,
      paddingBottom: 5, borderBottom: '1.5px solid #e2e8f0',
      fontFamily: F,
    }}>
      {title}
    </div>
  )
}

function TimelineDot({ last = false }: { last?: boolean }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, width: 14 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e40af' }} />
      {!last && <div style={{ flex: 1, width: 1.5, background: '#bfdbfe', marginTop: 3, minHeight: 20 }} />}
    </div>
  )
}

function TemplateB({ cv }: { cv: CVData }) {
  const name   = `${cv.vorname} ${cv.nachname}`.trim() || 'Ihr Name'
  const addr   = [cv.strasse, [cv.plz, cv.stadt].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const hasExp = cv.erfahrungen.some(e => e.position || e.firma)
  const hasEdu = cv.ausbildungen.some(e => e.abschluss || e.institution)

  const contacts = [
    cv.email    && cv.email,
    cv.telefon  && cv.telefon,
    addr        && addr,
    cv.linkedin && cv.linkedin,
  ].filter(Boolean) as string[]

  return (
    <div style={{ fontFamily: F, fontSize: 12, color: '#0f172a', background: '#fff', padding: '28px 32px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 14, alignItems: 'flex-start' }}>
        {cv.foto ? (
          <img src={cv.foto} alt="Foto"
            style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {name.toUpperCase()}
          </div>
          {cv.berufsbezeichnung && (
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, marginBottom: 7 }}>
              {cv.berufsbezeichnung}
            </div>
          )}
          {cv.profil && (
            <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.7, color: '#374151' }}>{cv.profil}</p>
          )}
        </div>
      </div>

      {/* ── Contact row ── */}
      {contacts.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '4px 16px',
          padding: '8px 0', marginBottom: 4,
          borderTop: '1.5px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0',
          fontSize: 10.5, color: '#374151',
        }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}

      {/* ── Berufserfahrung ── */}
      {hasExp && (
        <>
          <ModernLabel title="Berufserfahrung" />
          {cv.erfahrungen.filter(e => e.position || e.firma).map((exp, idx, arr) => (
            <div key={exp.id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <TimelineDot last={idx === arr.length - 1} />
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{exp.position}</span>
                  {(exp.von || exp.bis) && (
                    <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {[exp.von, exp.bis].filter(Boolean).join(' – ')}
                    </span>
                  )}
                </div>
                {(exp.firma || exp.ort) && (
                  <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 3 }}>
                    {[exp.firma, exp.ort].filter(Boolean).join(', ')}
                  </div>
                )}
                {exp.taetigkeiten && (
                  <ul style={{ margin: '3px 0 0', paddingLeft: 13, color: '#374151', lineHeight: 1.65, fontSize: 10.5 }}>
                    {exp.taetigkeiten.split('\n').filter(Boolean).map((t, i) => <li key={i} style={{ marginBottom: 1 }}>{t}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Ausbildung ── */}
      {hasEdu && (
        <>
          <ModernLabel title="Ausbildung" />
          {cv.ausbildungen.filter(e => e.abschluss || e.institution).map((edu, idx, arr) => (
            <div key={edu.id} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <TimelineDot last={idx === arr.length - 1} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{edu.abschluss}</span>
                  {(edu.von || edu.bis) && (
                    <span style={{ fontSize: 10, color: '#64748b' }}>{[edu.von, edu.bis].filter(Boolean).join(' – ')}</span>
                  )}
                </div>
                {(edu.institution || edu.ort) && (
                  <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 2 }}>{[edu.institution, edu.ort].filter(Boolean).join(', ')}</div>
                )}
                {edu.hinweis && <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{edu.hinweis}</p>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Bescheinigungen ── */}
      {cv.bescheinigungen.length > 0 && (
        <>
          <ModernLabel title="Bescheinigungen" />
          {cv.bescheinigungen.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e40af', flexShrink: 0, marginTop: 4 }} />
              <span style={{ fontSize: 11, color: '#374151' }}>{b}</span>
            </div>
          ))}
        </>
      )}

      {/* ── Fähigkeiten ── */}
      {cv.skills.length > 0 && (
        <>
          <ModernLabel title="Fähigkeiten" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {cv.skills.map(s => (
              <span key={s} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 99, padding: '3px 10px', fontSize: 10.5, fontWeight: 500, color: '#374151' }}>{s}</span>
            ))}
          </div>
        </>
      )}

      {/* ── Führerschein ── */}
      {cv.fuehrerschein && (
        <>
          <ModernLabel title="Führerscheine" />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e40af', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#374151' }}>{cv.fuehrerschein}</span>
          </div>
        </>
      )}

      {/* ── Sprachen ── */}
      {cv.sprachen.some(l => l.sprache) && (
        <>
          <ModernLabel title="Sprachen" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cv.sprachen.filter(l => l.sprache).map(l => (
              <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e40af', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#374151' }}><strong>{l.sprache}</strong> – {l.niveau}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {(!cv.profil && !hasExp && !hasEdu && cv.skills.length === 0) && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#cbd5e1', fontSize: 13 }}>
          Füllen Sie das Formular aus — Ihr Lebenslauf erscheint hier.
        </div>
      )}
    </div>
  )
}

// ── Template C: Blauer Header + Datum-Spalte ─────────────────────────────────

function TemplateC({ cv }: { cv: CVData }) {
  const name   = `${cv.vorname} ${cv.nachname}`.trim() || 'Ihr Name'
  const addr   = [cv.strasse, [cv.plz, cv.stadt].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const hasExp = cv.erfahrungen.some(e => e.position || e.firma)
  const hasEdu = cv.ausbildungen.some(e => e.abschluss || e.institution)

  const contacts = [
    cv.email    && { icon: 'mail',  text: cv.email    },
    cv.telefon  && { icon: 'phone', text: cv.telefon  },
    addr        && { icon: 'loc',   text: addr        },
    cv.linkedin && { icon: 'in',    text: cv.linkedin },
  ].filter(Boolean) as { icon: string; text: string }[]

  const BlueSection = ({ title }: { title: string }) => (
    <div style={{ marginTop: 18, marginBottom: 8 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1e40af', fontFamily: F, marginBottom: 5 }}>
        {title}
      </div>
      <div style={{ height: 1.5, background: '#1e40af' }} />
    </div>
  )

  const IconC = ({ type }: { type: string }) => {
    const s = { width: 11, height: 11, flexShrink: 0 as const }
    if (type === 'mail')  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
    if (type === 'phone') return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.38h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.96-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    if (type === 'loc')   return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
    return <span style={{ fontSize: 9, fontWeight: 900, fontFamily: 'serif', lineHeight: 1 }}>in</span>
  }

  return (
    <div style={{ fontFamily: F, fontSize: 12, color: '#0f172a', background: '#fff' }}>

      {/* ── Blue Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'center' }}>
        {cv.foto ? (
          <img src={cv.foto} alt="Foto"
            style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '2px solid rgba(255,255,255,0.25)' }} />
        ) : (
          <div style={{ width: 88, height: 88, background: 'rgba(255,255,255,0.15)', borderRadius: 6, flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {name}
          </div>
          {cv.berufsbezeichnung && (
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(186,230,253,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 9 }}>
              {cv.berufsbezeichnung}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, color: 'rgba(255,255,255,0.9)' }}>
                <IconC type={c.icon} />
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '12px 28px 24px' }}>

        {cv.profil && (
          <>
            <BlueSection title="Profil" />
            <p style={{ margin: '0 0 4px', lineHeight: 1.7, color: '#374151', fontSize: 11 }}>{cv.profil}</p>
          </>
        )}

        {hasExp && (
          <>
            <BlueSection title="Berufserfahrung" />
            {cv.erfahrungen.filter(e => e.position || e.firma).map(exp => (
              <div key={exp.id} style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 86, flexShrink: 0, fontSize: 10, color: '#64748b', lineHeight: 1.5, paddingTop: 1 }}>
                  {[exp.von, exp.bis].filter(Boolean).join(' – ')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{exp.position}</div>
                  {(exp.firma || exp.ort) && (
                    <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 3 }}>
                      {[exp.firma, exp.ort].filter(Boolean).join(' – ')}
                    </div>
                  )}
                  {exp.taetigkeiten && (
                    <p style={{ margin: 0, fontSize: 10.5, color: '#374151', lineHeight: 1.65 }}>
                      {exp.taetigkeiten.split('\n').filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {hasEdu && (
          <>
            <BlueSection title="Ausbildung" />
            {cv.ausbildungen.filter(e => e.abschluss || e.institution).map(edu => (
              <div key={edu.id} style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                <div style={{ width: 86, flexShrink: 0, fontSize: 10, color: '#64748b', paddingTop: 1 }}>
                  {[edu.von, edu.bis].filter(Boolean).join(' – ')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{edu.abschluss}</div>
                  {(edu.institution || edu.ort) && (
                    <div style={{ fontSize: 10.5, color: '#475569', marginBottom: 2 }}>
                      {[edu.institution, edu.ort].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {edu.hinweis && <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{edu.hinweis}</p>}
                </div>
              </div>
            ))}
          </>
        )}

        {cv.skills.length > 0 && (
          <>
            <BlueSection title="Fähigkeiten" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cv.skills.map(s => (
                <span key={s} style={{ border: '1.5px solid #1e40af', borderRadius: 4, padding: '3px 10px', fontSize: 10.5, color: '#1e40af', fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {cv.sprachen.some(l => l.sprache) && (
          <>
            <BlueSection title="Sprachen" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cv.sprachen.filter(l => l.sprache).map(l => (
                <div key={l.id} style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontWeight: 700, fontSize: 11.5, minWidth: 80 }}>{l.sprache}</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>{l.niveau}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {cv.fuehrerschein && (
          <>
            <BlueSection title="Führerscheine" />
            <div style={{ fontSize: 11, color: '#374151' }}>{cv.fuehrerschein}</div>
          </>
        )}

        {cv.bescheinigungen.length > 0 && (
          <>
            <BlueSection title="Bescheinigungen" />
            {cv.bescheinigungen.map((b, i) => (
              <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 3 }}>{b}</div>
            ))}
          </>
        )}

        {(!cv.profil && !hasExp && !hasEdu && cv.skills.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#cbd5e1', fontSize: 13 }}>
            Füllen Sie das Formular aus — Ihr Lebenslauf erscheint hier.
          </div>
        )}
      </div>
    </div>
  )
}

// ── CV Preview wrapper ─────────────────────────────────────────────────────────

function CVPreview({ cv, template }: { cv: CVData; template: Template }) {
  return (
    <div className="cv-paper" style={{
      width: '100%', background: '#fff',
      boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      {template === 'A' ? <TemplateA cv={cv} /> : template === 'B' ? <TemplateB cv={cv} /> : <TemplateC cv={cv} />}
    </div>
  )
}

// ── Template Selector ─────────────────────────────────────────────────────────

function TemplateSelector({ active, onChange }: { active: Template; onChange: (t: Template) => void }) {
  return (
    <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {([
        { id: 'A' as Template, label: 'Klassisch' },
        { id: 'B' as Template, label: 'Modern'    },
        { id: 'C' as Template, label: 'Blauer Header' },
      ] as const).map(t => (
        <button key={t.id} className={`tmpl-btn${active === t.id ? ' active' : ''}`} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', marginBottom: 32 }}>
      {STEPS.map((s) => (
        <div key={s.n} style={{
          flex: 1, textAlign: 'center', paddingBottom: 10,
          borderBottom: `2.5px solid ${current >= s.n ? '#7c3aed' : '#e2e8f0'}`,
          transition: 'border-color 0.25s ease',
        }}>
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
  const [cv, setCv]             = useState<CVData>(INITIAL)
  const [step, setStep]         = useState(1)
  const [template, setTemplate] = useState<Template>('A')

  const handlePrint = () => {
    const cvEl = document.querySelector<HTMLElement>('.cv-paper')
    if (!cvEl) { window.print(); return }

    const win = window.open('', '_blank')
    if (!win) { window.print(); return }

    win.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Lebenslauf</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: white;
           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    @page { margin: 0; size: A4 portrait; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    img { max-width: 100%; }
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
        <div className="no-print" style={{
          background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 60%, #7c3aed 100%)',
          padding: '80px 28px 36px',
        }}>
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
              2 professionelle Designs · Foto hochladen · Direkt als PDF herunterladen.
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
                    <button className="nav-step-btn" onClick={() => setStep(s => s + 1)}
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
                      {step === 4 ? 'Zur Vorschau' : 'Weiter →'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ marginBottom: 16, color: '#7c3aed' }}>
                    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', fontFamily: F, marginBottom: 8 }}>
                    Ihr Lebenslauf ist fertig!
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, lineHeight: 1.7, margin: '0 auto 24px', maxWidth: 300 }}>
                    Design rechts wählen, dann "PDF herunterladen" klicken.
                  </p>
                  <button onClick={handlePrint} style={{
                    width: '100%', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#fff', borderRadius: 12, padding: '14px',
                    fontSize: 15, fontWeight: 700, fontFamily: F,
                    boxShadow: '0 4px 20px rgba(124,58,237,0.45)', marginBottom: 12,
                  }}>
                    PDF herunterladen
                  </button>
                  <button onClick={() => setStep(4)} style={{
                    width: '100%', border: '1.5px solid #e2e8f0', cursor: 'pointer',
                    background: '#f8fafc', color: '#374151', borderRadius: 12, padding: '12px',
                    fontSize: 14, fontWeight: 600, fontFamily: F, marginBottom: 28,
                  }}>
                    Bearbeiten
                  </button>

                  <div style={{ padding: '16px 18px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6d28d9', fontFamily: F, marginBottom: 4 }}>
                      Tipp: Profil auf pheweb anlegen
                    </div>
                    <p style={{ fontSize: 12.5, color: '#64748b', fontFamily: F, margin: '0 0 12px', lineHeight: 1.65 }}>
                      Laden Sie Ihren Lebenslauf in Ihr pheweb-Profil hoch und werden Sie von Unternehmen aus Elektro, TGA, SHK & Mechatronik gefunden.
                    </p>
                    <Link to="/kandidat/anfrage" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', background: '#7c3aed', borderRadius: 8, padding: '8px 16px' }}>
                      Jetzt Profil erstellen →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="cv-preview-col" style={{ position: 'sticky', top: 88 }}>
            <TemplateSelector active={template} onChange={setTemplate} />
            <div className="no-print" style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Live-Vorschau
            </div>
            <CVPreview cv={cv} template={template} />
          </div>

        </div>
      </div>
    </>
  )
}
