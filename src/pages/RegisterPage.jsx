import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const PRIVATE = ["gmail.com","googlemail.com","yahoo.com","yahoo.de","hotmail.com","hotmail.de","outlook.com","outlook.de","live.com","live.de","web.de","gmx.de","gmx.net","gmx.at","gmx.ch","icloud.com","me.com","mac.com","t-online.de","freenet.de","arcor.de","aol.com","aol.de","protonmail.com","proton.me","mailbox.org","posteo.de","tutanota.com","mail.ru","1und1.de","vodafone.de","telekom.de","o2online.de","msn.com"];
const isPrivate = e => PRIVATE.includes(e.split("@")[1]?.toLowerCase());
const C = { accent:"#3b72b8", accentBg:"#eef4ff", accentBd:"rgba(59,114,184,0.18)", text:"#0f1623", muted:"#4b5675", faint:"#8b9ab1", border:"rgba(15,22,35,0.08)", red:"#dc2626", shadowLg:"0 20px 60px rgba(59,114,184,0.12)" };
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INP = { width:"100%", background:"#f5f7fa", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"13px 16px", fontSize:15, color:C.text, outline:"none", fontFamily:F, marginBottom:12, boxSizing:"border-box" };

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function PwField({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", marginBottom:12 }}>
      <input style={{...INP, marginBottom:0, paddingRight:48}} type={show?"text":"password"} placeholder={placeholder} required value={value} onChange={onChange} />
      <button type="button" onClick={()=>setShow(!show)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.faint, padding:0, display:"flex", alignItems:"center" }}>
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ unternehmen:"", email:"", password:"", password2:"" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const setF = k => e => setForm({...form,[k]:e.target.value});

  const handle = async e => {
    e.preventDefault(); setError("");
    if (!form.unternehmen.trim()) { setError("Bitte geben Sie Ihren Unternehmensnamen ein."); return; }
    if (isPrivate(form.email)) { setError("Bitte verwenden Sie Ihre geschäftliche E-Mail-Adresse. Private Adressen (Gmail, GMX, Yahoo etc.) sind nicht erlaubt."); return; }
    if (form.password.length < 8) { setError("Passwort muss mindestens 8 Zeichen lang sein."); return; }
    if (form.password !== form.password2) { setError("Passwörter stimmen nicht überein."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email:form.email, password:form.password, options:{ data:{ unternehmen:form.unternehmen } } });
    if (error) setError("Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    else setSuccess(true);
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:F }}>
      <div style={{ width:"100%", maxWidth:440, background:"#fff", borderRadius:20, padding:36, boxShadow:C.shadowLg, textAlign:"center" }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:"#dcfce7", border:"2px solid #86efac", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:26 }}>✓</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:12 }}>Registrierung erfolgreich</h2>
        <p style={{ fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:24 }}>Bitte bestätigen Sie Ihre E-Mail-Adresse und melden Sie sich dann an.</p>
        <Link to="/login" style={{ display:"inline-block", background:C.accent, color:"#fff", borderRadius:12, padding:"13px 28px", fontSize:15, fontWeight:700, textDecoration:"none" }}>Zur Anmeldung</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:F }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Link to="/" style={{ fontFamily:F, fontSize:28, fontWeight:800, color:C.text, textDecoration:"none", letterSpacing:"-0.02em" }}>phe<em style={{ fontStyle:"italic", color:C.accent }}>web</em></Link>
          <p style={{ marginTop:8, fontSize:15, color:C.muted }}>Nur für Unternehmenskunden</p>
        </div>
        <div style={{ background:"#fff", borderRadius:20, padding:36, boxShadow:C.shadowLg, border:`1px solid ${C.border}` }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8, letterSpacing:"-0.01em" }}>Registrieren</h1>
          <p style={{ fontSize:13, color:C.faint, marginBottom:24, lineHeight:1.6 }}>Bitte verwenden Sie Ihre geschäftliche E-Mail-Adresse.</p>
          <form onSubmit={handle}>
            <label style={{ fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Unternehmensname *</label>
            <input style={INP} type="text" placeholder="Mustermann GmbH" required value={form.unternehmen} onChange={setF("unternehmen")} />
            <label style={{ fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Geschäftliche E-Mail *</label>
            <input style={INP} type="email" placeholder="ihre@firma.de" required value={form.email} onChange={setF("email")} />
            <p style={{ fontSize:12, color:C.faint, marginTop:-8, marginBottom:16 }}>⚠ Keine privaten E-Mail-Adressen (Gmail, GMX, Yahoo etc.)</p>
            <label style={{ fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Passwort *</label>
            <PwField placeholder="Mindestens 8 Zeichen" value={form.password} onChange={setF("password")} />
            <label style={{ fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Passwort bestätigen *</label>
            <PwField placeholder="Passwort wiederholen" value={form.password2} onChange={setF("password2")} />
            {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", marginBottom:16, marginTop:4 }}><p style={{ fontSize:13, color:C.red, lineHeight:1.5 }}>{error}</p></div>}
            <button type="submit" disabled={loading} style={{ width:"100%", marginTop:8, background:C.accent, color:"#fff", border:"none", borderRadius:12, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:F, opacity:loading?0.75:1 }}>
              {loading?"Wird registriert...":"Konto erstellen"}
            </button>
          </form>
          <p style={{ marginTop:20, textAlign:"center", fontSize:14, color:C.faint }}>Bereits ein Konto? <Link to="/login" style={{ color:C.accent, fontWeight:600, textDecoration:"none" }}>Anmelden</Link></p>
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.faint }}><Link to="/" style={{ color:C.faint, textDecoration:"none" }}>← Zurück zu pheweb.de</Link></p>
      </div>
    </div>
  );
}
