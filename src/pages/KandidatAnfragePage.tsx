// KandidatAnfragePage — Vermittlungsanfrage ohne Login
// Route: /kandidat/anfrage

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const BRANCHEN = [
  'Elektrotechnik / Elektroinstallation',
  'TGA (Technische Gebäudeausrüstung)',
  'SHK (Sanitär, Heizung, Klima)',
  'Mechatronik',
  'Industrieelektrik / Automatisierung',
  'Energietechnik',
  'Sonstiges',
]

const INP: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#f8fafc', border: '1.5px solid #e2e8f0',
  borderRadius: 10, padding: '12px 14px',
  fontSize: 15, color: '#0f172a', outline: 'none',
  fontFamily: F, transition: 'border-color 0.2s',
}

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#475569', marginBottom: 6,
}

const COOLDOWN_KEY = 'kandidat_anfrage_last'
const COOLDOWN_MS  = 60 * 60 * 1000 // 1 Stunde

export default function KandidatAnfragePage() {
  const [form, setForm] = useState({
    name: '', email: '', telefon: '', branche: '', erfahrung: '',
    _trap: '', // Honeypot — bleibt immer leer für echte Nutzer
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Honeypot: Bot hat Falle ausgefüllt → still ignorieren
    if (form._trap) { setDone(true); return }

    // Rate-Limit: max. 1 Anfrage pro Stunde (localStorage)
    const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
    if (Date.now() - last < COOLDOWN_MS) {
      setError('Sie haben bereits eine Anfrage gesendet. Bitte warten Sie eine Stunde.')
      return
    }

    setLoading(true)
    setError('')
    const { error: err } = await supabase
      .from('kandidat_anfragen')
      .insert({
        name:      form.name.trim(),
        email:     form.email.trim().toLowerCase(),
        telefon:   form.telefon.trim(),
        branche:   form.branche,
        erfahrung: form.erfahrung.trim() || null,
      })
    if (err) {
      setError('Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.')
    } else {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      setDone(true)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', fontFamily: F }}>

      {/* Nav */}
      <nav style={{ padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em', color: '#f1f5f9' }}>
          phe<span style={{ color: '#c4b5fd' }}>web</span>
        </Link>
        <Link to="/fuer-kandidaten" style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', textDecoration: 'none' }}>
          ← Zurück
        </Link>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 24 }}>✅</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: 12 }}>
                Anfrage eingegangen!
              </h1>
              <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
                Wir melden uns innerhalb von <strong style={{ color: '#c4b5fd' }}>24 Stunden</strong> bei Ihnen für ein kurzes Kennenlerngespräch (15–25 Min.).
                Halten Sie Ihr Telefon bereit.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12, padding: '14px 24px', fontSize: 14, color: '#c4b5fd', fontWeight: 600 }}>
                <span>📞</span>
                Wir rufen Sie unter <strong style={{ color: '#e9d5ff' }}>{form.telefon}</strong> an
              </div>
              <div style={{ marginTop: 40 }}>
                <Link to="/" style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'none' }}>
                  ← Zurück zur Startseite
                </Link>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <>
              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#c4b5fd', marginBottom: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
                  100 % kostenlos · Kein Account nötig
                </div>
                <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 12 }}>
                  Jetzt vermitteln lassen
                </h1>
                <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7 }}>
                  Füllen Sie das Formular aus. Wir melden uns innerhalb von 24h für ein
                  <strong style={{ color: '#c4b5fd' }}> 15–25 minütiges Kennenlerngespräch</strong> — danach kümmern wir uns um alles.
                </p>
              </div>

              {/* Card */}
              <div style={{ background: '#ffffff', borderRadius: 20, padding: '36px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <form onSubmit={submit}>
                  {/* Honeypot — für Bots unsichtbar, für Menschen leer */}
                  <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
                    <input tabIndex={-1} autoComplete="off" value={form._trap} onChange={set('_trap')} />
                  </div>

                  {/* Name */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={LABEL}>Vor- und Nachname *</label>
                    <input style={INP} type="text" placeholder="Max Mustermann" required value={form.name} onChange={set('name')} />
                  </div>

                  {/* Email + Telefon nebeneinander */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                    <div>
                      <label style={LABEL}>E-Mail-Adresse *</label>
                      <input style={INP} type="email" placeholder="ihre@email.de" required value={form.email} onChange={set('email')} />
                    </div>
                    <div>
                      <label style={LABEL}>Telefonnummer *</label>
                      <input style={INP} type="tel" placeholder="+49 123 456789" required value={form.telefon} onChange={set('telefon')} />
                    </div>
                  </div>

                  {/* Branche */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={LABEL}>Ihre Branche *</label>
                    <select style={{ ...INP, cursor: 'pointer', appearance: 'none' }} required value={form.branche} onChange={set('branche')}>
                      <option value="">Bitte wählen…</option>
                      {BRANCHEN.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  {/* Erfahrung optional */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={LABEL}>Aktuelle Position / Erfahrung <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                    <textarea
                      style={{ ...INP, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
                      placeholder="z.B. Elektriker mit 8 Jahren Erfahrung im Industriebereich, aktuell bei XY GmbH"
                      value={form.erfahrung}
                      onChange={set('erfahrung')}
                    />
                  </div>

                  {/* Hinweis-Box */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>📞</span>
                    <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6, margin: 0 }}>
                      <strong>Nächster Schritt:</strong> Wir rufen Sie für ein kurzes Kennenlerngespräch an (15–25 Min.). Danach entscheiden wir gemeinsam, ob eine Vermittlung Sinn macht — kostenlos und unverbindlich.
                    </p>
                  </div>

                  {error && (
                    <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 16, textAlign: 'center' }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                      color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: F, opacity: loading ? 0.75 : 1,
                      boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {loading ? 'Wird gesendet…' : 'Anfrage absenden →'}
                  </button>

                  <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                    Kein Account. Kein Passwort. Wir melden uns bei Ihnen.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
