import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const PRIVATE = ["gmail.com","googlemail.com","yahoo.com","yahoo.de","hotmail.com","hotmail.de","outlook.com","outlook.de","live.com","live.de","web.de","gmx.de","gmx.net","gmx.at","gmx.ch","icloud.com","me.com","mac.com","t-online.de","freenet.de","arcor.de","aol.com","aol.de","protonmail.com","proton.me","mailbox.org","posteo.de","tutanota.com","mail.ru","1und1.de","vodafone.de","telekom.de","o2online.de","msn.com"];
const isPrivate = e => PRIVATE.includes(e.split("@")[1]?.toLowerCase());
const getDomain = e => e.split("@")[1]?.toLowerCase();
const isValidPhone = p => /^\d{10,15}$/.test(p.replace(/[\s\-\+\(\)\/]/g,""));

const C = { accent:"#3b72b8", accentDk:"#2a5490", accentBg:"#eef4ff", accentBd:"rgba(59,114,184,0.18)", text:"#0f1623", muted:"#4b5675", faint:"#8b9ab1", border:"rgba(15,22,35,0.08)", borderMd:"rgba(15,22,35,0.13)", red:"#dc2626", redBg:"#fef2f2", shadowLg:"0 20px 60px rgba(59,114,184,0.12)" };
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INP = { width:"100%", background:"#f5f7fa", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"13px 16px", fontSize:15, color:C.text, outline:"none", fontFamily:F, boxSizing:"border-box", transition:"border 0.2s" };
const LABEL = { fontSize:13, fontWeight:600, color:C.muted, display:"block", marginBottom:6, marginTop:16 };

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({ unternehmen:"", whatsapp:"", bewerbungs_email:"", position:"", region:"", gehalt:"", info1:"", info2:"", info3:"", info4:"", info5:"" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data:{ user } }) => {
      if (!user) { navigate("/login"); return; }
      setUserEmail(user.email||"");
      const meta = user.user_metadata?.unternehmen||"";
      if (meta) setForm(f=>({...f, unternehmen:meta}));
    });
  }, [navigate]);

  const setF = k => e => setForm({...form,[k]:e.target.value});

  const handleWeiter = e => {
    e.preventDefault(); setError("");
    if (!form.unternehmen.trim()||!form.whatsapp.trim()||!form.bewerbungs_email.trim()) { setError("Bitte füllen Sie alle Pflichtfelder aus."); return; }
    if (!isValidPhone(form.whatsapp)) { setError("Bitte geben Sie eine gültige Mobilnummer ein (z.B. +49 173 9980100). Mindestens 10 Ziffern erforderlich."); return; }
    if (isPrivate(form.bewerbungs_email)) { setError("Bitte verwenden Sie eine geschäftliche E-Mail-Adresse. Private Adressen wie Gmail, GMX oder Yahoo sind nicht erlaubt."); return; }
    const userDomain = getDomain(userEmail);
    const bewDomain = getDomain(form.bewerbungs_email);
    if (userDomain && bewDomain && userDomain !== bewDomain) { setError(`Die Bewerbungs-E-Mail muss zur Domain Ihres Unternehmens gehören (@${userDomain}).`); return; }
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    if (!form.position||!form.region||!form.gehalt||!form.info1) { setError("Bitte füllen Sie alle Pflichtfelder aus."); return; }
    setLoading(true);
    try {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const { error:dbError } = await supabase.from("funnels").insert({ user_id:user.id, unternehmen:form.unternehmen, whatsapp:form.whatsapp, bewerbungs_email:form.bewerbungs_email, position:form.position, region:form.region, gehalt:form.gehalt, info1:form.info1, info2:form.info2, info3:form.info3, info4:form.info4, info5:form.info5, status:"In Bearbeitung" });
      if (dbError) throw dbError;
      await fetch("https://api.web3forms.com/submit", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ access_key:"9b89391f-fce9-4554-9fed-18d85fbad2df", subject:`Neuer Funnel: ${form.position} – ${form.unternehmen}`, ...form, kunden_email:user.email }) });
      navigate("/dashboard?success=1");
    } catch { setError("Fehler beim Speichern. Bitte versuchen Sie es erneut."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:F, padding:"40px 24px" }}>
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <Link to="/" style={{ fontFamily:F, fontSize:26, fontWeight:800, color:C.text, textDecoration:"none", letterSpacing:"-0.02em" }}>phe<em style={{ fontStyle:"italic", color:C.accent }}>web</em></Link>
          <p style={{ marginTop:8, fontSize:15, color:C.muted }}>Neuen Recruiting-Funnel erstellen</p>
        </div>

        <div style={{ display:"flex", alignItems:"center", marginBottom:32, maxWidth:340, margin:"0 auto 32px" }}>
          {[1,2].map((s,i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:step>=s?C.accent:"#e2e8f0", color:step>=s?"#fff":C.faint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, flexShrink:0 }}>{s}</div>
                <span style={{ fontSize:13, fontWeight:600, color:step>=s?C.accent:C.faint, whiteSpace:"nowrap" }}>{s===1?"Unternehmen":"Position"}</span>
              </div>
              {i===0&&<div style={{ flex:1, height:2, background:step>1?C.accent:"#e2e8f0", margin:"0 12px", borderRadius:2 }} />}
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:"36px 32px", boxShadow:C.shadowLg, border:`1px solid ${C.border}` }}>
          {step===1 && (
            <form onSubmit={handleWeiter}>
              <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:6 }}>Ihr Unternehmen</h2>
              <p style={{ fontSize:14, color:C.muted, marginBottom:24, lineHeight:1.6 }}>Diese Angaben erscheinen im Funnel und werden für die Bewerberkommunikation genutzt.</p>

              <label style={LABEL}>Unternehmensname *</label>
              <input style={INP} type="text" placeholder="z.B. Mustermann GmbH" required value={form.unternehmen} onChange={setF("unternehmen")} maxLength={100} />

              <label style={LABEL}>WhatsApp-Nummer für Bewerber *</label>
              <input style={INP} type="tel" placeholder="z.B. +49 173 9980100" required value={form.whatsapp} onChange={setF("whatsapp")} maxLength={30} />
              <p style={{ fontSize:12, color:C.faint, marginTop:6, lineHeight:1.5 }}>Muss eine gültige Mobilnummer sein. Bewerber kontaktieren Sie direkt über WhatsApp.</p>

              <label style={LABEL}>E-Mail für Bewerbungseingang *</label>
              <input style={INP} type="email" placeholder={`z.B. bewerbung@${getDomain(userEmail)||"ihrefirma.de"}`} required value={form.bewerbungs_email} onChange={setF("bewerbungs_email")} maxLength={160} />
              <p style={{ fontSize:12, color:C.faint, marginTop:6, lineHeight:1.5 }}>Muss eine geschäftliche Adresse Ihres Unternehmens sein{userEmail?` (@${getDomain(userEmail)})`:""}. Keine privaten E-Mail-Adressen.</p>

              {error && <div style={{ background:C.redBg, border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", marginTop:16 }}><p style={{ fontSize:13, color:C.red, lineHeight:1.5 }}>{error}</p></div>}

              <button type="submit" style={{ width:"100%", marginTop:28, background:C.accent, color:"#fff", border:"none", borderRadius:12, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:F }}>Weiter zur Position →</button>
            </form>
          )}

          {step===2 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:6 }}>Ihre offene Stelle</h2>
              <p style={{ fontSize:14, color:C.muted, marginBottom:24, lineHeight:1.6 }}>Je konkreter Ihre Angaben, desto besser die Ergebnisse.</p>

              <label style={LABEL}>Stellenbezeichnung *</label>
              <input style={INP} type="text" placeholder="z.B. Elektriker (m/w/d)" required value={form.position} onChange={setF("position")} maxLength={100} />
              <label style={LABEL}>Region / Einsatzort *</label>
              <input style={INP} type="text" placeholder="z.B. Düsseldorf / NRW" required value={form.region} onChange={setF("region")} maxLength={100} />
              <label style={LABEL}>Gehaltsspanne *</label>
              <input style={INP} type="text" placeholder="z.B. 45.000 – 55.000 €" required value={form.gehalt} onChange={setF("gehalt")} maxLength={60} />

              <div style={{ marginTop:24, padding:"18px 20px", background:C.accentBg, border:`1px solid ${C.accentBd}`, borderRadius:14 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.accentDk, marginBottom:14 }}>5 Vorteile der Stelle</p>
                {[["info1","z.B. Firmenwagen auch privat nutzbar",true],["info2","z.B. Unbefristete Festanstellung",false],["info3","z.B. 30 Tage Urlaub",false],["info4","z.B. Flexible Arbeitszeiten",false],["info5","z.B. Weiterbildungsmöglichkeiten",false]].map(([key,ph,req],i) => (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:i<4?10:0 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:C.accent, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                    <input style={{...INP,marginBottom:0}} type="text" placeholder={ph} required={req} value={form[key]} onChange={setF(key)} maxLength={120} />
                  </div>
                ))}
              </div>

              {error && <div style={{ background:C.redBg, border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", marginTop:16 }}><p style={{ fontSize:13, color:C.red, lineHeight:1.5 }}>{error}</p></div>}

              <div style={{ display:"flex", gap:10, marginTop:28 }}>
                <button type="button" onClick={()=>{setStep(1);setError("");}} style={{ flex:"0 0 auto", background:"none", border:`1.5px solid ${C.borderMd}`, borderRadius:12, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:F, color:C.muted }}>← Zurück</button>
                <button type="submit" disabled={loading} style={{ flex:1, background:C.accent, color:"#fff", border:"none", borderRadius:12, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:F, opacity:loading?0.75:1 }}>{loading?"Wird gespeichert...":"Funnel erstellen ✓"}</button>
              </div>
            </form>
          )}
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.faint }}><Link to="/dashboard" style={{ color:C.faint, textDecoration:"none" }}>← Zurück zum Dashboard</Link></p>
      </div>
    </div>
  );
}
