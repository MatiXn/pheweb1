import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { funnelJobs } from "../data/funnelJobs";

const C = {
  bg: "#ffffff",
  bgSoft: "#f5f7fa",
  accent: "#3b72b8",
  accentDk: "#2a5490",
  accentBg: "#eef4ff",
  accentBd: "rgba(59,114,184,0.18)",
  text: "#0f1623",
  muted: "#4b5675",
  faint: "#8b9ab1",
  border: "rgba(15,22,35,0.08)",
  borderMd: "rgba(15,22,35,0.13)",
  wa: "#22c55e",
  shadow: "0 2px 12px rgba(59,114,184,0.06)",
  shadowLg: "0 20px 60px rgba(59,114,184,0.12)",
};

const F = "'Bricolage Grotesque', sans-serif";
const FH = "'DM Serif Display', serif";
const wrap = { width: "min(1080px, calc(100% - 32px))", margin: "0 auto" };

const WA_URL = "https://wa.me/491739980100?text=Hallo%20Matin%2C%20ich%20m%C3%B6chte%20mehr%20%C3%BCber%20einen%20Recruiting-Funnel%20erfahren.";

const BTN = {
  primary: { display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", borderRadius: 999, fontFamily: F, fontWeight: 700, textDecoration: "none", background: C.accent, color: "#fff", padding: "14px 26px", fontSize: 15, boxShadow: "0 4px 20px rgba(59,114,184,0.22)" },
  outline:  { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, fontFamily: F, fontWeight: 700, textDecoration: "none", background: "#fff", color: C.text, border: `1.5px solid ${C.borderMd}`, padding: "14px 26px", fontSize: 15 },
  wa:       { display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", borderRadius: 999, fontFamily: F, fontWeight: 700, textDecoration: "none", background: C.wa, color: "#fff", padding: "14px 26px", fontSize: 15 },
};

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 42px" }}>
      <div style={{ fontFamily: F, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: C.accent, marginBottom: 14 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: F, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 800, color: C.text, marginBottom: 14 }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: F, fontSize: 17, lineHeight: 1.75, color: C.muted }}>{subtitle}</p>}
    </div>
  );
}

function InfoCard({ title, items, icon }) {
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: 24, boxShadow: C.shadow, height: "100%" }}>
      <h3 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, marginBottom: 14, color: C.text }}>{title}</h3>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <li key={item} style={{ display: "flex", gap: 10, fontFamily: F, fontSize: 15, color: C.muted, lineHeight: 1.65 }}>
            <span style={{ color: C.accent, fontWeight: 800, flexShrink: 0 }}>{icon}</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "28px 18px", textAlign: "center", boxShadow: C.shadow }}>
      <div style={{ fontFamily: F, fontSize: "clamp(34px,5vw,52px)", fontWeight: 800, lineHeight: 1, color: C.accent, marginBottom: 8 }}>{value}</div>
      <div style={{ fontFamily: F, fontSize: 12, color: C.muted, lineHeight: 1.6, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

export default function VacancyFunnelPage() {
  const { slug } = useParams();
  const job = useMemo(() => Object.values(funnelJobs).find((e) => e.slug === slug), [slug]);

  if (!job) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 520 }}>
          <h1 style={{ fontFamily: F, fontSize: 32, fontWeight: 800, marginBottom: 14, color: C.text }}>Seite nicht gefunden</h1>
          <p style={{ fontFamily: F, fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>Diese Funnel-Seite existiert nicht.</p>
          <Link to="/" style={BTN.primary}>Zurück zur Startseite</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Serif+Display:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{-webkit-font-smoothing:antialiased}
        body{font-family:'Bricolage Grotesque',sans-serif;background:#fff;color:#0f1623}
        a{text-decoration:none;color:inherit}
        .lift:hover{transform:translateY(-2px)!important;filter:brightness(1.03)}
      `}</style>

      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg,#ffffff 0%,#f7f9fc 100%)", padding: "120px 0 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 55% at 50% -5%,rgba(59,114,184,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={wrap}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentBg, border: `1px solid ${C.accentBd}`, color: C.accent, borderRadius: 999, padding: "7px 16px", fontFamily: F, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            Demo-Funnel · {job.shortTitle}
          </div>
          <h1 style={{ fontFamily: FH, fontSize: "clamp(38px,6vw,68px)", lineHeight: 1.04, letterSpacing: "-0.03em", fontWeight: 400, color: C.text, marginBottom: 18 }}>
            {job.heroTitle}<br /><em style={{ fontStyle: "italic", color: C.accent }}>als Recruiting-Funnel gedacht.</em>
          </h1>
          <p style={{ fontFamily: F, fontSize: "clamp(16px,2vw,19px)", lineHeight: 1.7, color: C.muted, maxWidth: 800, marginBottom: 28 }}>{job.heroSubtitle}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <Link to="/#kontakt" className="lift" style={BTN.primary}>Analyse anfragen</Link>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={BTN.wa}>Per WhatsApp schreiben</a>
            <Link to="/" className="lift" style={BTN.outline}>Zurück zu pheweb</Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {job.benefits.map((item) => (
              <span key={item} style={{ display: "inline-flex", alignItems: "center", padding: "8px 14px", borderRadius: 999, background: "#fff", border: `1px solid ${C.border}`, fontFamily: F, fontSize: 14, color: C.muted, fontWeight: 600, boxShadow: C.shadow }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* POSITION INFO */}
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <div style={wrap}>
          <SectionTitle eyebrow="Position im Fokus" title={`Warum ein Funnel für ${job.shortTitle} sinnvoll ist`} subtitle={job.intro} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {[["Region", job.location], ["Typische Gehaltsspanne", job.salary], ["Zielgruppe", job.audience]].map(([label, val]) => (
              <div key={label} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 }}>
                <div style={{ fontFamily: F, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: C.faint, fontWeight: 700, marginBottom: 10 }}>{label}</div>
                <div style={{ fontFamily: F, fontSize: label === "Zielgruppe" ? 16 : 20, fontWeight: 800, color: C.text, lineHeight: 1.5 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEME VS LÖSUNG */}
      <section style={{ background: C.bgSoft, padding: "80px 0" }}>
        <div style={wrap}>
          <SectionTitle eyebrow="Typische Hürden" title={`Wo Unternehmen bei ${job.shortTitle} Bewerber verlieren`} subtitle="Genau hier setzt der Funnel an – mit einem klaren Prozess statt allgemeiner Versprechen." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
            <InfoCard title="Häufige Probleme" items={job.problems} icon="✕" />
            <InfoCard title="Was der Funnel anders macht" items={job.funnelSteps} icon="✓" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <div style={wrap}>
          <SectionTitle eyebrow="Typische Zielwerte" title={`Was bei ${job.shortTitle} realistisch möglich ist`} subtitle="Mit sauberer Strecke, klarer Ansprache und schnellem Follow-up werden Ergebnisse planbarer." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            {job.proof.map((item) => <StatBox key={item.label} value={item.value} label={item.label} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.accentBg, padding: "80px 0", borderTop: `1px solid ${C.accentBd}`, borderBottom: `1px solid ${C.accentBd}` }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <SectionTitle eyebrow="Nächster Schritt" title={`Lassen Sie uns prüfen, ob ein Funnel für ${job.shortTitle} zu Ihrer Vakanz passt`} subtitle="Wenn Sie diese Position aktuell besetzen möchten, analysieren wir gerne gemeinsam, wie ein sinnvoller Funnel aufgebaut werden kann." />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/#kontakt" className="lift" style={BTN.primary}>Kostenlose Analyse anfragen</Link>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={BTN.wa}>Direkt per WhatsApp schreiben</a>
          </div>
        </div>
      </section>
    </>
  );
}
