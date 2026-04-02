import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const C = { accent:"#3b72b8", accentBg:"#eef4ff", text:"#0f1623", muted:"#4b5675", faint:"#8b9ab1", border:"rgba(15,22,35,0.08)", red:"#dc2626", shadowLg:"0 20px 60px rgba(59,114,184,0.12)" };
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INP = { width:"100%", background:"#f5f7fa", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"13px 16px", fontSize:15, color:C.text, outline:"none", fontFamily:F, marginBottom:12, boxSizing:"border-box" };

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PwField({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", marginBottom:12 }}>
      <input style={{...INP, marginBottom:0, paddingRight:48}} type={show?"text":"password"} placeholder={placeholder} required value={value} onChange={onChange} />
      <button type="button" onClick={()=>setShow(!show)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.faint, padding:0, display:"flex", alignItems:"center" }}>
        <EyeIcon visible={show} />
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email oder Passwort falsch. Bitte erneut versuchen.");
    else navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:F }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <Link to="/" style={{ fontFamily:F, fontSize:28, fontWeight:800, color:C.text, textDecoration:"none", letterSpacing:"-0.02em" }}>phe<em style={{ fontStyle:"italic", color:C.accent }}>web</em></Link>
          <p style={{ marginTop:8, fontSize:15, color:C.muted }}>Melden Sie sich in Ihrem Konto an</p>
        </div>
        <div style={{ background:"#fff", borderRadius:20, padding:36, boxShadow:C.shadowLg, border:`1px solid ${C.border}` }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:24, letterSpacing:"-0.01em" }}>Anmelden</h1>
          <form onSubmit={handle}>
            <label style={{ fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>E-Mail-Adresse</label>
            <input style={INP} type="email" placeholder="ihre@firma.de" required value={email} onChange={e=>setEmail(e.target.value)} />
            <label style={{ fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6 }}>Passwort</label>
            <PwField placeholder="Ihr Passwort" value={password} onChange={e=>setPassword(e.target.value)} />
            {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", marginBottom:16 }}><p style={{ fontSize:13, color:C.red, lineHeight:1.5 }}>{error}</p></div>}
            <button type="submit" disabled={loading} style={{ width:"100%", marginTop:8, background:C.accent, color:"#fff", border:"none", borderRadius:12, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:F, opacity:loading?0.75:1 }}>
              {loading?"Wird angemeldet...":"Anmelden"}
            </button>
          </form>
          <p style={{ marginTop:20, textAlign:"center", fontSize:14, color:C.faint }}>Noch kein Konto? <Link to="/register" style={{ color:C.accent, fontWeight:600, textDecoration:"none" }}>Jetzt registrieren</Link></p>
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.faint }}><Link to="/" style={{ color:C.faint, textDecoration:"none" }}>← Zurück zu pheweb.de</Link></p>
      </div>
    </div>
  );
}
