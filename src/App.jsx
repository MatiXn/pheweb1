import { useState, useEffect, useRef } from "react";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const C = {
  bg:       "#ffffff",
  bgSoft:   "#f7f9fc",
  bgMid:    "#eef3fa",
  accent:   "#3b72b8",
  accentDk: "#2a5490",
  accentBg: "#eef4ff",
  accentBd: "rgba(59,114,184,0.20)",
  text:     "#111827",
  muted:    "#4b5675",
  faint:    "#8b9ab1",
  border:   "rgba(15,22,35,0.08)",
  borderMd: "rgba(15,22,35,0.13)",
  wa:       "#22c55e",
  waDk:     "#16a34a",
  shadow:   "0 2px 12px rgba(59,114,184,0.07)",
  shadowMd: "0 8px 32px rgba(59,114,184,0.11)",
  shadowLg: "0 20px 60px rgba(59,114,184,0.13)",
};
const FD = "'Bricolage Grotesque', sans-serif";
const FH = "'DM Serif Display', serif";

// ── RESPONSIVE HOOK ───────────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ── IN-VIEW HOOK ──────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, v];
}

// ── FADE UP ───────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

// ── BUTTON STYLES ─────────────────────────────────────────────────────────────
const B = {
  base: { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, border:"none", cursor:"pointer", fontWeight:600, transition:"all 0.22s ease", borderRadius:999, fontFamily:FD, whiteSpace:"nowrap", textDecoration:"none" },
};
B.primary = { ...B.base, background:C.accent, color:"#fff", boxShadow:"0 4px 20px rgba(59,114,184,0.28)" };
B.outline  = { ...B.base, background:"#fff", color:C.text, border:`1.5px solid ${C.borderMd}`, boxShadow:C.shadow };
B.wa       = { ...B.base, background:C.wa, color:"#fff", boxShadow:"0 4px 18px rgba(34,197,94,0.26)" };
B.ghost    = { ...B.base, background:C.accentBg, color:C.accent, border:`1px solid ${C.accentBd}` };

// ── SHARED ────────────────────────────────────────────────────────────────────
const wrap = { width:"min(1080px, calc(100% - 32px))", margin:"0 auto" };
const H2   = { fontFamily:FH, fontSize:"clamp(30px,4vw,50px)", lineHeight:1.06, letterSpacing:"-0.03em", fontWeight:400, color:C.text };
const EYE  = { display:"inline-block", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:C.accent, marginBottom:14 };
const LEAD = { fontSize:17, lineHeight:1.75, color:C.muted, maxWidth:620, margin:"14px auto 0" };
const INP  = { width:"100%", background:C.bgSoft, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"13px 16px", fontSize:14, color:C.text, outline:"none", fontFamily:FD, transition:"border 0.2s" };

const WA_URL = "https://wa.me/491739980100?text=Hallo%20Matin%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Recruiting-L%C3%B6sung%20und%20m%C3%B6chte%20mehr%20erfahren.";
const WA_BEW = "https://wa.me/491739980100?text=Hallo%20Matin%2C%20ich%20m%C3%B6chte%20mich%20gerne%20per%20WhatsApp%20bewerben.";

// ── LEGAL ─────────────────────────────────────────────────────────────────────
const LEGAL = {
  impressum: {
    title: "Impressum",
    body: [
      ["Angaben gemäß § 5 TMG","pheweb – Ein Angebot der PHE-Perm Engineering Ingenieure & Techniker GmbH, Hüttenstraße 30, 40215 Düsseldorf"],
      ["Vertreten durch","Matin Askaryar (Geschäftsführer)"],
      ["Kontakt","E-Mail: matin@phe-perm.de"],
      ["Registereintrag","Registergericht: Amtsgericht Düsseldorf · Registernummer: HRB (bitte eintragen)"],
      ["Umsatzsteuer-ID","USt-IdNr. gemäß § 27a UStG: DE (bitte eintragen)"],
      ["Verantwortlich nach § 55 Abs. 2 RStV","Matin Askaryar, Hüttenstraße 30, 40215 Düsseldorf"],
      ["Streitschlichtung","Wir nehmen nicht an Streitbeilegungsverfahren teil."],
      ["Haftungsausschluss","Als Diensteanbieter sind wir gemäß § 7 TMG für eigene Inhalte verantwortlich. Nach §§ 8–10 TMG besteht keine Überwachungspflicht fremder Informationen."],
    ]
  },
  datenschutz: {
    title: "Datenschutzerklärung",
    body: [
      ["1. Verantwortlicher","Matin Askaryar · PHE-Perm Engineering Ingenieure & Techniker GmbH · Hüttenstraße 30, 40215 Düsseldorf · matin@phe-perm.de"],
      ["2. Erhebung personenbezogener Daten","Daten werden erhoben, wenn Sie das Kontaktformular nutzen: Name, Unternehmen, E-Mail, Telefon, Nachricht. Rechtsgrundlage: Art. 6 Abs. 1 lit. b und lit. f DSGVO."],
      ["3. Formular-Dienst FormSubmit","Kontaktanfragen werden über FormSubmit (formsubmit.co) verarbeitet. Datenschutzinfo: formsubmit.co/privacy.pdf"],
      ["4. Server-Log-Dateien","Der Hosting-Anbieter erfasst Zugriffsdaten (IP, Browser, Betriebssystem, Zeit). Zusammenführung mit anderen Daten findet nicht statt."],
      ["5. Cookies","Diese Website verwendet keine Tracking-Cookies oder Analyse-Tools."],
      ["6. Ihre Rechte","Recht auf Auskunft, Berichtigung, Löschung. Kontakt: matin@phe-perm.de"],
      ["7. Beschwerderecht","Zuständige Behörde: Landesbeauftragter für Datenschutz NRW · ldi.nrw.de"],
    ]
  },
  agb: {
    title: "Allgemeine Geschäftsbedingungen",
    body: [
      ["§ 1 Geltungsbereich","Diese AGB gelten für alle Verträge zwischen der PHE-Perm Engineering Ingenieure & Techniker GmbH, Matin Askaryar, Hüttenstraße 30, 40215 Düsseldorf, und dem jeweiligen Auftraggeber."],
      ["§ 2 Leistungsgegenstand","pheweb erbringt Dienstleistungen im Bereich digitaler Recruiting-Lösungen – Recruiting-Landingpages, Bewerbungsfunnels und begleitende Systeme."],
      ["§ 3 Vertragsschluss","Angebote sind freibleibend. Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung zustande."],
      ["§ 4 Vergütung und Zahlung","Rechnungen sind innerhalb von 14 Tagen ohne Abzug zahlbar. Bei Verzug gelten gesetzliche Verzugszinsen."],
      ["§ 5 Mitwirkungspflichten","Der Auftraggeber stellt alle notwendigen Informationen rechtzeitig zur Verfügung."],
      ["§ 6 Nutzungsrechte","Nach vollständiger Zahlung erhält der Auftraggeber ein einfaches Nutzungsrecht. pheweb behält das Recht zur Portfolionutzung."],
      ["§ 7 Haftung","Haftung besteht nur bei Vorsatz und grober Fahrlässigkeit. Mittelbare Schäden sind ausgeschlossen."],
      ["§ 8 Schlussbestimmungen","Es gilt deutsches Recht. Gerichtsstand ist Düsseldorf für Kaufleute."],
    ]
  }
};

function LegalOverlay({ page, onClose }) {
  if (!page) return null;
  const { title, body } = LEGAL[page];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:C.bg, overflowY:"auto" }}>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 24px 80px" }}>
        <button onClick={onClose} style={{ ...B.ghost, padding:"9px 18px", fontSize:14, marginBottom:36, borderRadius:10 }}>← Zurück zur Website</button>
        <h1 style={{ fontFamily:FH, fontSize:"clamp(28px,5vw,40px)", marginBottom:6 }}>{title}</h1>
        <p style={{ fontSize:13, color:C.faint, marginBottom:40 }}>Stand: März 2026</p>
        {body.map(([h,p]) => (
          <div key={h} style={{ marginBottom:24 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:8 }}>{h}</h2>
            <p style={{ fontSize:15, color:C.muted, lineHeight:1.8 }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MARQUEE ───────────────────────────────────────────────────────────────────
const MQ_ITEMS = ["Elektrotechnik","Anlagenbau","Facility Management","Maschinenbau","Instandhaltung","Servicetechnik","Gebäudetechnik","Industrielogistik","Handwerk","IT & Netzwerktechnik"];

// ── GEAR CARD ─────────────────────────────────────────────────────────────────
function Gear({ n, sub, title, desc, tags, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:"#fff", border:`1.5px solid ${hov ? C.accentBd : C.border}`,
        borderRadius:20, padding:"24px 20px", position:"relative", overflow:"hidden",
        transition:"all 0.28s ease",
        transform: hov ? "translateY(-5px)" : v ? "translateY(0)" : "translateY(28px)",
        opacity: v ? 1 : 0,
        transitionDelay: v ? `${delay}s` : "0s",
        boxShadow: hov ? C.shadowLg : C.shadow,
        display:"flex", flexDirection:"column", gap:0,
      }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:C.accent, transform: hov ? "scaleX(1)" : "scaleX(0)", transformOrigin:"left", transition:"transform 0.28s ease" }} />
      <div style={{ fontFamily:FH, fontStyle:"italic", fontSize:13, color:C.faint, border:`1px solid ${C.border}`, borderRadius:999, display:"inline-block", padding:"3px 11px", marginBottom:12, alignSelf:"flex-start" }}>{n}</div>
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.accent, marginBottom:6 }}>{sub}</div>
      <h3 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:10, lineHeight:1.3, wordBreak:"break-word" }}>{title}</h3>
      <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, marginBottom:14, flex:1 }}>{desc}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {tags.map((t,i) => (
          <div key={i} style={{ background: i===0 ? C.accentBg : C.bgSoft, border:`1px solid ${i===0 ? C.accentBd : C.border}`, borderRadius:8, padding:"7px 12px", fontSize:13, fontWeight: i===0 ? 700 : 500, color: i===0 ? C.accentDk : C.muted, wordBreak:"break-word" }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

// ── CASE CARD ─────────────────────────────────────────────────────────────────
function CaseCard({ industry, title, desc, nums, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:"#fff", border:`1.5px solid ${hov ? C.accentBd : C.border}`,
        borderRadius:22, padding:28, transition:"all 0.28s ease",
        transform: hov ? "translateY(-5px)" : v ? "translateY(0)" : "translateY(28px)",
        opacity: v ? 1 : 0, transitionDelay: v ? `${delay}s` : "0s",
        boxShadow: hov ? C.shadowLg : C.shadow,
      }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.faint, marginBottom:8 }}>{industry}</div>
      <h3 style={{ fontFamily:FH, fontSize:22, fontWeight:400, color:C.accentDk, marginBottom:10, lineHeight:1.2 }}>{title}</h3>
      <p style={{ fontSize:14, color:C.muted, marginBottom:20, lineHeight:1.7 }}>{desc}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {nums.map(({ v:val, l }) => (
          <div key={l} style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 8px", textAlign:"center" }}>
            <span style={{ display:"block", fontSize:22, fontWeight:800, color:C.text, lineHeight:1, marginBottom:4 }}>{val}</span>
            <span style={{ fontSize:10, color:C.faint, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BENE CARD ─────────────────────────────────────────────────────────────────
function BeneCard({ icon, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:"#fff", border:`1.5px solid ${hov ? C.accentBd : C.border}`,
        borderRadius:20, padding:26, transition:"all 0.28s ease",
        transform: hov ? "translateY(-4px)" : v ? "translateY(0)" : "translateY(28px)",
        opacity: v ? 1 : 0, transitionDelay: v ? `${delay}s` : "0s",
        boxShadow: hov ? C.shadowMd : C.shadow,
      }}>
      <div style={{ width:44, height:44, background:C.accentBg, border:`1px solid ${C.accentBd}`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
        <span style={{ fontFamily:FH, fontStyle:"italic", fontSize:16, color:C.accent }}>{icon}</span>
      </div>
      <h4 style={{ fontSize:16, fontWeight:700, marginBottom:8, color:C.text }}>{title}</h4>
      <p style={{ fontSize:14, color:C.muted, lineHeight:1.7 }}>{desc}</p>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ num, label, delay }) {
  const [ref, v] = useInView();
  const [count, setCount] = useState(0);
  const isRange = num.includes("–");
  const target = parseInt(num.replace(/\D/g, "")) || 0;
  useEffect(() => {
    if (!v) return;
    let start = null;
    const dur = 1000;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), delay * 1000);
    return () => clearTimeout(t);
  }, [v]);
  const display = isRange ? num : String(count);
  return (
    <div ref={ref} style={{
      padding:"40px 24px", textAlign:"center",
      background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:20, boxShadow:C.shadow,
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(28px)",
      transition:`opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      <span style={{ fontFamily:FH, fontSize:"clamp(42px,6vw,66px)", fontStyle:"italic", color:C.accent, lineHeight:1, display:"block", marginBottom:10 }}>{display}</span>
      <div style={{ fontSize:14, color:C.muted, lineHeight:1.65, maxWidth:180, margin:"0 auto" }}>{label}</div>
    </div>
  );
}

// ── MOBILE NAV ────────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose, scrollTo }) {
  if (!open) return null;
  const links = [["Das System","system"],["Prozess","prozess"],["Angebot","angebot"],["Kontakt","kontakt"]];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(255,255,255,0.98)", backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32 }}>
      {links.map(([l,id]) => (
        <button key={id} onClick={() => { scrollTo(id); onClose(); }} style={{ fontSize:28, fontFamily:FH, fontWeight:400, color:C.text, background:"none", border:"none", cursor:"pointer" }}>{l}</button>
      ))}
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ ...B.wa, padding:"14px 32px", fontSize:16, marginTop:8 }}>Per WhatsApp anfragen</a>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const w = useWidth();
  const isMobile = w < 640;
  const isTablet = w < 900;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalPage, setLegalPage] = useState(null);
  const [form, setForm] = useState({ name:"",unternehmen:"",email:"",telefon:"",positionen:"",kontaktweg:"",nachricht:"" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
    setMenuOpen(false);
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Responsive grid helpers
  const cols = (desktop, tablet, mobile) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Serif+Display:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
        body{font-family:'Bricolage Grotesque',sans-serif;background:#fff;overflow-x:hidden}
        a{color:inherit;text-decoration:none}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .h-badge{animation:heroIn 0.6s 0.1s ease both}
        .h-title{animation:heroIn 0.7s 0.2s ease both}
        .h-sub{animation:heroIn 0.7s 0.3s ease both}
        .h-ctas{animation:heroIn 0.7s 0.4s ease both}
        .h-trust{animation:heroIn 0.7s 0.5s ease both}
        .h-visual{animation:heroIn 0.9s 0.55s ease both}
        .float{animation:float 6s ease-in-out infinite}
        .pulse{animation:pulse 2.2s ease-in-out infinite}
        .mq-track{display:flex;animation:marquee 32s linear infinite}
        .mq-track:hover{animation-play-state:paused}
        .lift:hover{transform:translateY(-2px)!important}
        .step-c:hover{border-color:rgba(59,114,184,0.28)!important;transform:translateY(-3px)!important;box-shadow:0 8px 32px rgba(59,114,184,0.11)!important}
        input:focus,textarea:focus,select:focus{border-color:rgba(59,114,184,0.45)!important;box-shadow:0 0 0 3px rgba(59,114,184,0.10)!important}
      `}</style>

      <LegalOverlay page={legalPage} onClose={() => setLegalPage(null)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} scrollTo={scrollTo} />

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:999,
        background: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        boxShadow: scrolled ? "0 1px 16px rgba(59,114,184,0.07)" : "none",
        transition:"all 0.3s ease",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, padding: isMobile ? "16px 20px" : "18px 32px", maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontFamily:FH, fontSize: isMobile ? 20 : 24, letterSpacing:"-0.02em", color:C.text, cursor:"pointer" }} onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}>
            phe<em style={{ fontStyle:"italic", color:C.accent }}>web</em>
          </div>

          {/* Desktop links */}
          {!isTablet && (
            <div style={{ display:"flex", alignItems:"center", gap:28 }}>
              {[["Das System","system"],["Prozess","prozess"],["Angebot","angebot"],["Kontakt","kontakt"]].map(([l,id]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{ fontSize:14, fontWeight:500, color:C.muted, background:"none", border:"none", cursor:"pointer", fontFamily:FD, transition:"color 0.2s" }}>{l}</button>
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {!isMobile && (
              <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...B.primary, padding:"9px 20px", fontSize:13.5 }}>Analyse anfragen</button>
            )}
            {isTablet && (
              <button onClick={() => setMenuOpen(true)} style={{ background:"none", border:`1.5px solid ${C.borderMd}`, borderRadius:10, padding:"8px 14px", cursor:"pointer", fontSize:20, color:C.text, lineHeight:1 }}>☰</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: isMobile ? 110 : 140, paddingBottom: isMobile ? 60 : 100, background:C.bg, textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,114,184,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={wrap}>
          <div className="h-badge" style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.accentBg, border:`1px solid ${C.accentBd}`, color:C.accent, borderRadius:999, padding:"7px 16px", fontSize:13, fontWeight:600, marginBottom:28 }}>
            <span className="pulse" style={{ width:6, height:6, borderRadius:"50%", background:C.accent, display:"inline-block" }} />
            Recruiting-System · Mittelstand &amp; Industrie
          </div>

          <h1 className="h-title" style={{ ...H2, fontSize:"clamp(38px,7vw,78px)", marginBottom:20 }}>
            Mehr Bewerber.<br />In <em style={{ fontStyle:"italic", color:C.accent }}>30 Tagen.</em>
          </h1>

          <p className="h-sub" style={{ ...LEAD, fontSize:"clamp(15px,2vw,18px)", margin:"0 auto 36px" }}>
            Kein Tool, kein Zufall – ein System aus Traffic, Funnel, Qualifizierung und Follow-up. Alle vier Bausteine greifen ineinander. Fehlt einer, passiert nichts.
          </p>

          <div className="h-ctas" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
            <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...B.primary, padding: isMobile ? "14px 24px" : "16px 36px", fontSize: isMobile ? 15 : 16, width: isMobile ? "100%" : "auto" }}>
              Kostenlose Analyse anfragen
            </button>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={{ ...B.wa, padding: isMobile ? "14px 24px" : "16px 36px", fontSize: isMobile ? 15 : 16, width: isMobile ? "100%" : "auto" }}>
              Per WhatsApp anfragen
            </a>
            {!isMobile && (
              <button onClick={() => scrollTo("system")} className="lift" style={{ ...B.outline, padding:"16px 36px", fontSize:16 }}>
                Das System ansehen
              </button>
            )}
          </div>

          <div className="h-trust" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: isMobile ? 12 : 20, flexWrap:"wrap" }}>
            {["Zufriedene Kunden","Antwort innerhalb 24h","Ohne Website-Relaunch"].map((t,i) => (
              <span key={i} style={{ fontSize:13, color:C.faint, fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
                {i > 0 && <span style={{ color:C.border }}>|</span>}{t}
              </span>
            ))}
          </div>

          {/* Hero Mockup */}
          {!isMobile && (
            <div className="h-visual" style={{ marginTop:56, maxWidth:720, marginLeft:"auto", marginRight:"auto" }}>
              <div className="float" style={{ background:"#fff", border:`1px solid ${C.borderMd}`, borderRadius:24, boxShadow:C.shadowLg, overflow:"hidden" }}>
                <div style={{ background:C.bgSoft, padding:"12px 18px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {["#ff6b6b","#ffd93d","#6bcb77"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
                  </div>
                  <div style={{ flex:1, background:"#fff", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 14px", fontSize:12, fontFamily:"monospace", color:C.faint, textAlign:"center" }}>pheweb.de/elektriker-nrw</div>
                  <div style={{ width:50 }} />
                </div>
                <div style={{ padding:24, display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:20, textAlign:"left" }}>
                  <div>
                    <div style={{ display:"inline-flex", background:C.accentBg, color:C.accent, borderRadius:999, padding:"4px 12px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>Schnellbewerbung</div>
                    <div style={{ fontFamily:FH, fontSize:24, lineHeight:1.1, color:C.text, marginBottom:14 }}>Elektriker (m/w/d)<br />gesucht – NRW</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                      {[["Gehalt","48 – 58 T€"],["Firmenwagen","Inkl. privat"],["Bewerbung","Ohne Lebenslauf"],["Dauer","60 Sekunden"]].map(([l,v]) => (
                        <div key={l} style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 12px" }}>
                          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.09em", color:C.faint, fontWeight:700, marginBottom:3 }}>{l}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:14, padding:14 }}>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Jetzt bewerben</div>
                      <input style={{ ...INP, marginBottom:8, fontSize:13 }} placeholder="Vorname & Nachname" readOnly />
                      <input style={{ ...INP, marginBottom:10, fontSize:13 }} placeholder="Telefonnummer" readOnly />
                      <div style={{ background:C.accent, color:"#fff", borderRadius:8, padding:10, fontSize:13, fontWeight:700, textAlign:"center", marginBottom:7 }}>Bewerbung absenden</div>
                      <a href={WA_BEW} target="_blank" rel="noopener noreferrer" style={{ display:"block", background:C.wa, color:"#fff", borderRadius:8, padding:10, fontSize:13, fontWeight:700, textAlign:"center" }}>Per WhatsApp bewerben</a>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ background:`linear-gradient(135deg,${C.accent} 0%,#5b8fd4 100%)`, borderRadius:14, padding:"18px 14px", color:"#fff", textAlign:"center" }}>
                      <span style={{ display:"block", fontSize:36, fontWeight:800, lineHeight:1, marginBottom:4 }}>+38%</span>
                      <span style={{ fontSize:11, opacity:0.8, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>Conversion-Rate</span>
                    </div>
                    {[["60s","Bewerbzeit"],["25","Bewerbungen / 30 Tage"]].map(([v,l]) => (
                      <div key={l} style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:C.accentBg, border:`1px solid ${C.accentBd}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:FH, fontStyle:"italic", fontSize:14, color:C.accent }}>→</div>
                        <div>
                          <div style={{ fontSize:19, fontWeight:800, color:C.text, lineHeight:1, marginBottom:2 }}>{v}</div>
                          <div style={{ fontSize:11, color:C.faint, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ padding:"24px 0", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, background:C.bgSoft, overflow:"hidden" }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.faint, textAlign:"center", marginBottom:16 }}>Geeignet für Unternehmen mit akutem Personalbedarf</div>
        <div className="mq-track">
          {[...MQ_ITEMS,...MQ_ITEMS].map((item,i) => (
            <span key={i} style={{ display:"inline-flex", alignItems:"center", padding:"9px 22px", margin:"0 6px", background:"#fff", border:`1px solid ${C.border}`, borderRadius:999, fontSize:14, fontWeight:600, color:C.muted, whiteSpace:"nowrap", boxShadow:"0 1px 4px rgba(59,114,184,0.05)", flexShrink:0 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:C.borderMd, marginRight:10, display:"inline-block" }} />{item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section id="system" style={{ background:C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Das Problem</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Eine Anzeige allein reicht nicht.<br /><em style={{ fontStyle:"italic", color:C.accent }}>Ein System schon.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Die meisten schalten eine Anzeige, verlinken eine Seite und warten. Das Ergebnis: wenig Resonanz, schlechte Qualität, keine Kontrolle.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr 1fr","1fr 1fr 1fr","1fr"), gap:16, marginTop:48 }}>
            <StatCard num="20–27" label="Bewerbungen pro Position in 30 Tagen – mit dem richtigen System" delay={0.3} />
            <StatCard num="5–8"   label="Qualifizierte Kandidaten nach Vorfilterung und WhatsApp-Flow" delay={0.45} />
            <StatCard num="2"     label="Einstellungen pro Position – realistisch und planbar" delay={0.6} />
          </div>
        </div>
      </section>

      {/* ── 4 GEARS ── */}
      <section style={{ background:"#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Die 4 Bausteine</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Fehlt einer, passiert <em style={{ fontStyle:"italic", color:C.accent }}>nichts.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Alle vier Bausteine müssen greifen. Erst dann liefert das System verlässlich qualifizierte Bewerber – Woche für Woche.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr 1fr 1fr","1fr 1fr","1fr"), gap:16, marginTop:48 }}>
            {[
              { n:"01", sub:"Traffic",        title:"Aufmerksamkeit", desc:"Bewerber finden Sie nicht von allein. Gezielte Werbung bringt die richtigen Menschen auf Ihre Seite.",          tags:["Meta Ads – Hauptquelle","Google Ads – Ergänzung","TikTok – optional"] },
              { n:"02", sub:"Funnel",         title:"Konversion",     desc:"Ihre Seite muss konvertieren. Klare Headline, 60-Sekunden-Bewerbung, WhatsApp sofort sichtbar.",               tags:["Fokussierte Headline","Bewerbung unter 60 Sek.","WhatsApp als Kanal"] },
              { n:"03", sub:"Qualifizierung", title:"Vorauswahl",     desc:"Nicht jeder Bewerber passt. Gezielte Fragen filtern heraus, wer wirklich relevant ist.",                       tags:["WhatsApp-Flow","3–5 Qualifizierungsfragen","Kriterienbasiert"] },
              { n:"04", sub:"Follow-up",      title:"Nachverfolgung", desc:"90 % antworten nicht sofort. Hier entscheidet sich, ob ein Lead zu einem Gespräch wird.",                     tags:["Antwort unter 5 Minuten","Telefonischer Rückruf","Reminder-Prozess"] },
            ].map((g,i) => <Gear key={g.n} {...g} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ── COMPARE ── */}
      <section id="vergleich" style={{ background:C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Der Unterschied</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Nicht Anzeige – Warten.<br />Sondern System – <em style={{ fontStyle:"italic", color:C.accent }}>Ergebnis.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Viele verlieren Bewerber im entscheidenden Moment – zwischen Interesse und tatsächlicher Bewerbung.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr","1fr 1fr","1fr"), gap:16, marginTop:48 }}>
            {[
              { bg:"#fef2f2", bd:"#fecaca", badgeBg:"#fee2e2", badgeColor:"#b91c1c", label:"Klassischer Ansatz", title:"Anzeige. Seite. Warten.", mark:"✕", markColor:"#b91c1c", items:["Viele Ablenkungen, kein klarer Pfad","Hohe Absprungraten auf mobilen Geräten","Unstrukturierte Candidate Journey","Kein Follow-up – Leads gehen verloren","Keine Qualifizierung, keine Steuerbarkeit"] },
              { bg:C.accentBg, bd:C.accentBd, badgeBg:"#dbeafe", badgeColor:C.accentDk, label:"Mit System", title:"Anzeige. Funnel. Termin.", mark:"✓", markColor:C.accent, items:["Fokussierter Pfad ohne Ablenkung","Mobile-first, optimiert auf Conversion","Zielgruppenspezifische Ansprache","Sofortiges Follow-up in unter 5 Minuten","Vorqualifizierung entlang klarer Kriterien"] },
            ].map((c,ci) => (
              <FadeUp key={ci} delay={ci * 0.12}>
                <div style={{ borderRadius:24, padding: isMobile ? 24 : 36, background:c.bg, border:`1.5px solid ${c.bd}`, height:"100%", textAlign:"center" }}>
                  <div style={{ display:"inline-flex", fontSize:11.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", padding:"5px 14px", borderRadius:999, marginBottom:16, background:c.badgeBg, color:c.badgeColor }}>{c.label}</div>
                  <h3 style={{ fontFamily:FH, fontSize:"clamp(20px,3vw,26px)", fontWeight:400, lineHeight:1.2, marginBottom:20 }}>{c.title}</h3>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
                    {c.items.map((item,ii) => (
                      <li key={ii} style={{ display:"flex", gap:10, fontSize:15, color:C.muted, lineHeight:1.65, alignItems:"flex-start" }}>
                        <span style={{ color:c.markColor, fontWeight:800, fontSize:13, flexShrink:0, marginTop:1 }}>{c.mark}</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section id="prozess" style={{ background:"#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Konkrete Schritte</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Von der Anzeige zum<br /><em style={{ fontStyle:"italic", color:C.accent }}>Vorstellungsgespräch.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Jeder Schritt ist definiert, messbar und optimierbar.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr 1fr","1fr 1fr","1fr"), gap:16, marginTop:48 }}>
            {[
              ["01","Angebot schärfen","Ein klares Angebot für eine konkrete Zielgruppe. Nicht zehn Stellen – ein Job, klar formuliert, mit echten Vorteilen."],
              ["02","Traffic aufsetzen","Meta Ads als Hauptquelle: Ziel Leads, Budget ab 10–30 Euro täglich, regional und berufsspezifisch."],
              ["03","Funnel verbinden","Anzeige führt direkt auf Ihre Landingpage oder WhatsApp-Chat. Kein Umweg, keine Ablenkung."],
              ["04","Qualifizieren","Per WhatsApp-Flow werden Bewerber mit 3–5 gezielten Fragen vorqualifiziert. Direkt und menschlich."],
              ["05","Nachverfolgen","Antwortzeit unter 5 Minuten. Strukturierter Reminder-Prozess. Ein Lead ohne Follow-up ist kein Lead."],
              ["06","Messen & skalieren","Conversion-Raten und Lead-Qualität werden ausgewertet. Was funktioniert, wird skaliert."],
            ].map(([n,title,desc],i) => (
              <FadeUp key={n} delay={i * 0.07}>
                <div className="step-c" style={{ background:C.bgSoft, border:`1.5px solid ${C.border}`, borderRadius:20, padding:"26px 22px", textAlign:"left", transition:"all 0.28s ease", height:"100%", boxShadow:C.shadow }}>
                  <span style={{ fontFamily:FH, fontSize:42, fontStyle:"italic", color:C.bgMid, lineHeight:1, display:"block", marginBottom:14 }}>{n}</span>
                  <h3 style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:8, lineHeight:1.3 }}>{title}</h3>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.75 }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASES ── */}
      <section style={{ background:C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Typische Ergebnisse</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Was möglich ist, wenn<br />alle 4 Bausteine <em style={{ fontStyle:"italic", color:C.accent }}>greifen.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Realistische Zahlen aus dem Mittelstand – 30 Tage pro Position.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr 1fr","1fr 1fr","1fr"), gap:16, marginTop:48 }}>
            <CaseCard delay={0}   industry="Elektrotechnik · NRW"        title="Elektriker gesucht"        desc="Fokussierter Funnel und schnelles Follow-up brachten in 30 Tagen qualifizierte Bewerbungen ohne Streuung." nums={[{v:"27",l:"Bewerbungen"},{v:"7",l:"Qualifiziert"},{v:"2",l:"Einstellungen"}]} />
            <CaseCard delay={0.1} industry="Industrieanlagen · Rheinland" title="Servicetechniker gesucht"  desc="Bessere Zielgruppenansprache und reduzierte Reibung erhöhten Qualität und Anzahl der Bewerbungen spürbar." nums={[{v:"22",l:"Bewerbungen"},{v:"6",l:"Qualifiziert"},{v:"2",l:"Einstellungen"}]} />
            <CaseCard delay={0.2} industry="Instandhaltung · Ruhrgebiet"  title="Mechatroniker gesucht"     desc="Funnel-Logik ergänzt bestehende Karriereinhalte und erzeugt einen soliden, qualifizierten Bewerberpool." nums={[{v:"25",l:"Bewerbungen"},{v:"8",l:"Qualifiziert"},{v:"2",l:"Einstellungen"}]} />
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ background:"#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Was Sie bekommen</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Ein System, das auf<br /><em style={{ fontStyle:"italic", color:C.accent }}>Performance</em> ausgelegt ist.</h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Ihre bestehende Website bleibt bestehen. Wir bauen ein Bewerbersystem, das messbar funktioniert.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr 1fr","1fr 1fr","1fr"), gap:16, marginTop:48 }}>
            {[
              ["01","Zielgruppen-Landingpages","Fokussierte Seiten für konkrete Vakanzen statt generischer Karriereinhalte.",0],
              ["02","Mobile-first","Aufgebaut für Kandidaten, die auf dem Handy scrollen – nicht am Desktop.",0.06],
              ["03","Weniger Reibung","60-Sekunden-Bewerbung ohne Lebenslauf. Kein komplizierter Prozess.",0.12],
              ["04","Vorqualifizierung","Nur Bewerber, die wirklich passen, kommen in Ihren Prozess.",0.18],
              ["05","Messbare KPIs","Conversion-Raten, Lead-Qualität und Besetzungszeit – alles sichtbar.",0.24],
              ["06","Schnell live","Kein langer Relaunch. Das System ist innerhalb von Tagen aktiv.",0.30],
            ].map(([icon,title,desc,delay]) => <BeneCard key={title} icon={icon} title={title} desc={desc} delay={delay} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="angebot" style={{ background:C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Angebot</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Das passende Setup für<br />Ihren <em style={{ fontStyle:"italic", color:C.accent }}>Recruiting-Bedarf.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>Von der fokussierten Landingpage bis zum vollständigen System mit allen 4 Bausteinen.</p></FadeUp>
          <div style={{ display:"grid", gridTemplateColumns: cols("1fr 1fr","1fr 1fr","1fr"), gap:16, marginTop:48, maxWidth:840, marginLeft:"auto", marginRight:"auto" }}>
            {[
              { featured:false, badge:null, type:"Recruiting Landingpage", price:"2.500 – 3.500 €", hint:"Einmalig · inkl. Setup", desc:"Für Unternehmen, die eine konkrete Position mit einer fokussierten Bewerberstrecke unterstützen möchten.", items:["Landingpage für eine konkrete Vakanz","Zielgruppenspezifische Texte & Struktur","Mobile Bewerbung mit reduzierter Reibung","Weiterleitung per E-Mail oder bestehende Systeme","Optional mit WhatsApp-Kanal"], btnStyle:"outline" },
              { featured:true,  badge:"Empfohlen", type:"Recruiting Funnel System", price:"4.500 – 7.500 €", hint:"Einmalig · inkl. Setup & Beratung", desc:"Für Unternehmen mit wiederkehrendem Bedarf – alle 4 Bausteine: Traffic, Funnel, Qualifizierung und Follow-up.", items:["Vollständiger Funnel mit allen 4 Bausteinen","Meta Ads Struktur und Anzeigentexte","WhatsApp-Qualifizierungs-Flow und Skripte","Follow-up-Prozess mit Reminder-Logik","Optional mit laufender Optimierung"], btnStyle:"primary" },
            ].map((p,pi) => (
              <FadeUp key={pi} delay={pi * 0.12} style={{ height:"100%" }}>
                <div style={{ background: p.featured ? C.accentBg : "#fff", border:`1.5px solid ${p.featured ? C.accent : C.border}`, borderRadius:24, padding: isMobile ? 24 : 36, textAlign:"left", height:"100%", display:"flex", flexDirection:"column" }}>
                  {p.badge && <div style={{ display:"inline-block", background:C.accent, color:"#fff", borderRadius:999, padding:"4px 14px", fontSize:12, fontWeight:700, marginBottom:14, alignSelf:"flex-start" }}>{p.badge}</div>}
                  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.faint, marginBottom:8 }}>{p.type}</div>
                  <div style={{ fontFamily:FH, fontSize:"clamp(28px,4vw,40px)", fontWeight:400, color:C.text, lineHeight:1, marginBottom:4 }}>{p.price}</div>
                  <div style={{ fontSize:13, color:C.faint, marginBottom:18 }}>{p.hint}</div>
                  <div style={{ height:1, background:C.border, margin:"0 0 18px" }} />
                  <div style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:18 }}>{p.desc}</div>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10, marginBottom:24, flex:1 }}>
                    {p.items.map((item,ii) => (
                      <li key={ii} style={{ display:"flex", gap:10, fontSize:14, color:C.muted, alignItems:"flex-start", lineHeight:1.6 }}>
                        <span style={{ color:C.accent, fontSize:13, marginTop:1, flexShrink:0, fontWeight:700 }}>→</span>{item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...B[p.btnStyle], width:"100%", borderRadius:12, padding:"13px 20px" }}>Anfragen</button>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <div style={{ maxWidth:620, margin:"20px auto 0", padding:18, background:C.accentBg, border:`1px solid ${C.accentBd}`, borderRadius:12, fontSize:14, color:C.muted, fontStyle:"italic", lineHeight:1.65, textAlign:"center" }}>
              Entscheidend ist nicht nur Reichweite – sondern ein System, das vom ersten Klick bis zum Vorstellungsgespräch funktioniert.
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:C.accentBg, borderTop:`1px solid ${C.accentBd}`, borderBottom:`1px solid ${C.accentBd}`, padding: isMobile ? "64px 0" : "96px 0", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 70% at 50% 50%, rgba(59,114,184,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={wrap}>
          <FadeUp><span style={EYE}>Nächster Schritt</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Analysieren wir gemeinsam,<br />wo Ihr Recruiting <em style={{ fontStyle:"italic", color:C.accent }}>Wirkung verliert.</em></h2></FadeUp>
          <FadeUp delay={0.2}><p style={LEAD}>In einer kurzen Erstaufnahme analysieren wir Ihre Candidate Journey, identifizieren Schwachstellen und definieren sinnvolle nächste Schritte – kostenlos und unverbindlich.</p></FadeUp>
          <FadeUp delay={0.3}>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginTop:32 }}>
              <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...B.primary, padding: isMobile ? "14px 24px" : "16px 36px", fontSize:16, width: isMobile ? "100%" : "auto" }}>Kostenlose Analyse anfragen</button>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={{ ...B.wa, padding: isMobile ? "14px 24px" : "16px 36px", fontSize:16, width: isMobile ? "100%" : "auto" }}>Per WhatsApp schreiben</a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="kontakt" style={{ background:"#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <FadeUp><span style={EYE}>Kontakt</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...H2, marginBottom:14 }}>Schreiben Sie uns –<br />wir melden uns <em style={{ fontStyle:"italic", color:C.accent }}>innerhalb von 24h.</em></h2></FadeUp>
          <FadeUp delay={0.2} style={{ maxWidth:680, margin:"36px auto 0" }}>
            <div style={{ background:"#fff", border:`1.5px solid ${C.borderMd}`, borderRadius:24, padding: isMobile ? "24px 18px" : "44px 40px", boxShadow:C.shadowLg }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:24 }}>
                {["matin@phe-perm.de","Auch per WhatsApp erreichbar","Antwort innerhalb 24h"].map(t => (
                  <span key={t} style={{ display:"inline-flex", alignItems:"center", padding:"7px 14px", borderRadius:999, background:C.bgSoft, border:`1px solid ${C.border}`, fontSize:13, color:C.muted, fontWeight:500 }}>{t}</span>
                ))}
              </div>
              {sent ? (
                <div style={{ padding:"40px 20px", textAlign:"center" }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", background:C.accentBg, border:`2px solid ${C.accentBd}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontFamily:FH, fontSize:28, color:C.accent }}>✓</div>
                  <h3 style={{ fontFamily:FH, fontSize:28, marginBottom:10 }}>Anfrage erhalten!</h3>
                  <p style={{ color:C.muted, fontSize:16 }}>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10, marginBottom:10 }}>
                    <input style={INP} placeholder="Vor- und Nachname" required value={form.name} onChange={setF("name")} />
                    <input style={INP} placeholder="Unternehmen" required value={form.unternehmen} onChange={setF("unternehmen")} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10, marginBottom:10 }}>
                    <input style={INP} type="email" placeholder="E-Mail-Adresse" required value={form.email} onChange={setF("email")} />
                    <input style={INP} type="tel" placeholder="Telefonnummer" required value={form.telefon} onChange={setF("telefon")} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10, marginBottom:10 }}>
                    <input style={INP} placeholder="Welche Positionen besetzen Sie?" value={form.positionen} onChange={setF("positionen")} />
                    <select style={INP} value={form.kontaktweg} onChange={setF("kontaktweg")}>
                      <option value="">Bevorzugter Kontaktweg</option>
                      <option>Telefon</option><option>E-Mail</option><option>WhatsApp</option>
                    </select>
                  </div>
                  <textarea style={{ ...INP, minHeight:110, resize:"vertical", display:"block", marginBottom:10, lineHeight:1.6 }} placeholder="Was sind Ihre größten Herausforderungen im Recruiting?" required value={form.nachricht} onChange={setF("nachricht")} />
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>
                    <button type="submit" className="lift" style={{ ...B.primary, width:"100%", borderRadius:12, padding:"14px 20px" }}>Analyse anfragen</button>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={{ ...B.wa, width:"100%", borderRadius:12, padding:"14px 20px" }}>Per WhatsApp schreiben</a>
                  </div>
                  <p style={{ marginTop:14, fontSize:12.5, color:C.faint, lineHeight:1.65, textAlign:"center" }}>
                    Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zu.{" "}
                    {[["Datenschutz","datenschutz"],["Impressum","impressum"],["AGB","agb"]].map(([l,id],i) => (
                      <span key={id}>{i > 0 && " · "}<button type="button" onClick={() => setLegalPage(id)} style={{ color:C.accent, textDecoration:"underline", background:"none", border:"none", cursor:"pointer", fontSize:"inherit", fontFamily:FD }}>{l}</button></span>
                    ))}
                  </p>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:C.bgSoft, borderTop:`1px solid ${C.border}`, padding:"48px 0 32px" }}>
        <div style={{ ...wrap, textAlign:"center" }}>
          <div style={{ fontFamily:FH, fontSize:22, color:C.text, marginBottom:10 }}>
            phe<em style={{ fontStyle:"italic", color:C.accent }}>web</em>
          </div>
          <p style={{ fontSize:14, color:C.faint, marginBottom:24, lineHeight:1.8 }}>
            Recruiting-Funnels für Unternehmen mit Fachkräftemangel.<br />
            Matin Askaryar · PHE-Perm Engineering Ingenieure &amp; Techniker GmbH<br />
            Hüttenstraße 30, 40215 Düsseldorf
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 24px", justifyContent:"center", marginBottom:24 }}>
            <a href="mailto:matin@phe-perm.de" style={{ fontSize:14, color:C.muted }}>matin@phe-perm.de</a>
            {[["Impressum","impressum"],["Datenschutz","datenschutz"],["AGB","agb"]].map(([l,id]) => (
              <button key={id} onClick={() => setLegalPage(id)} style={{ fontSize:14, color:C.muted, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2, fontFamily:FD }}>{l}</button>
            ))}
          </div>
          <div style={{ paddingTop:20, borderTop:`1px solid ${C.border}`, fontSize:13, color:C.faint }}>
            © 2026 pheweb
          </div>
        </div>
      </footer>
    </>
  );
}