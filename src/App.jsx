import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  bgSoft: "#f5f7fa",
  bgMid: "#e8eef7",
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
  red: "#dc2626",
  shadow: "0 2px 12px rgba(59,114,184,0.06)",
  shadowMd: "0 8px 32px rgba(59,114,184,0.10)",
  shadowLg: "0 20px 60px rgba(59,114,184,0.12)",
};

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const FH = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const WA_URL =
  "https://wa.me/491739980100?text=Hallo%20Matin%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Recruiting-L%C3%B6sung%20und%20m%C3%B6chte%20mehr%20erfahren.";
const WA_BEW =
  "https://wa.me/491739980100?text=Hallo%20Matin%2C%20ich%20m%C3%B6chte%20mich%20gerne%20per%20WhatsApp%20bewerben.";

// ── CONTENT ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  ["Das System", "system"],
  ["Prozess", "prozess"],
  ["Angebot", "angebot"],
  ["Kontakt", "kontakt"],
];

const HERO_TRUST = ["Ohne Website-Relaunch", "Schnell live", "Antwort innerhalb 24h"];

const INDUSTRIES = [
  "Elektrotechnik",
  "Anlagenbau",
  "Facility Management",
  "Maschinenbau",
  "Instandhaltung",
  "Servicetechnik",
  "Gebäudetechnik",
  "Industrielogistik",
  "Handwerk",
  "IT & Netzwerktechnik",
];

const OFFER_PACKAGES = [
  {
    featured: false,
    badge: null,
    type: "Einzel-Vakanz-Funnel",
    price: "2.500 – 3.500 €",
    hint: "Einmalig · inklusive Setup",
    desc: "Für Unternehmen, die eine konkrete offene Stelle mit einer fokussierten Bewerberstrecke besetzen möchten.",
    items: [
      "Landingpage für eine konkrete Vakanz",
      "Mobile Schnellbewerbung",
      "Klare Texte für Zielgruppe und Position",
      "Weiterleitung per E-Mail oder in bestehende Prozesse",
      "Optional mit WhatsApp-Bewerbung",
    ],
    btn: "outline",
    cta: "Jetzt anfragen",
  },
  {
    featured: true,
    badge: "Empfohlen",
    type: "Recruiting-System für mehrere offene Stellen",
    price: "4.500 – 7.500 €",
    hint: "Einmalig · inklusive Setup und Beratung",
    desc: "Für Unternehmen mit mehreren offenen Positionen oder wiederkehrendem Personalbedarf.",
    items: [
      "Vollständiges Funnel-System für mehrere Vakanzen",
      "Kampagnenstruktur für Reichweite und Bewerberfluss",
      "Vorqualifizierung per Formular oder WhatsApp",
      "Follow-up-Prozess für schnellere Reaktion",
      "Grundlage für wiederholbare Recruiting-Prozesse",
    ],
    btn: "primary",
    cta: "System anfragen",
  },
];

const STATS = [
  {
    num: "20–27",
    label: "Bewerbungen pro Position in 30 Tagen – mit strukturiertem System",
    delay: 0.3,
  },
  {
    num: "5–8",
    label: "Qualifizierte Kandidaten nach Vorfilterung – ohne Streuverlust",
    delay: 0.45,
  },
  {
    num: "2",
    label: "Einstellungen pro Position – realistisch, planbar, wiederholbar",
    delay: 0.6,
  },
];

const GEAR_ITEMS = [
  {
    n: "01",
    sub: "Traffic",
    title: "Gezielter Traffic",
    desc: "Die richtigen Menschen müssen Ihre Stelle überhaupt erst sehen. Mit gezielten Kampagnen bringen wir relevante Reichweite auf Ihre Vakanz.",
    tags: ["Meta Ads – Hauptkanal", "Regionale Aussteuerung", "Zielgruppenspezifisch"],
  },
  {
    n: "02",
    sub: "Funnel",
    title: "Konvertierender Funnel",
    desc: "Aus Interesse muss eine Bewerbung werden. Mit einer klaren, mobilen Bewerberstrecke reduzieren wir Reibung und erhöhen die Abschlussquote.",
    tags: ["Mobile Bewerbung", "Klare Headline", "Weniger Absprünge"],
  },
  {
    n: "03",
    sub: "Qualifizierung",
    title: "Strukturierte Vorqualifizierung",
    desc: "Nicht jede Bewerbung ist automatisch passend. Durch gezielte Fragen und einfache Vorfilterung landen nicht nur mehr, sondern bessere Kontakte im Prozess.",
    tags: ["3–5 gezielte Fragen", "WhatsApp optional", "Passendere Kontakte"],
  },
  {
    n: "04",
    sub: "Follow-up",
    title: "Konsequentes Follow-up",
    desc: "Die meisten Bewerber gehen nicht verloren, weil sie kein Interesse haben, sondern weil niemand sauber nachfasst. Ein klarer Prozess sorgt dafür, dass Anfragen schnell beantwortet werden.",
    tags: ["Schnelle Reaktion", "Klare Nachfasslogik", "Mehr Gespräche"],
  },
];

const EXAMPLE_FUNNELS = [
  { title: "Elektroniker (m/w/d)", desc: "Funnel für gewerblich-technische Fachkräfte mit klaren Vorteilen, mobiler Schnellbewerbung und WhatsApp-Strecke.", link: "/funnel/elektroniker" },
  { title: "Mechatroniker (m/w/d)", desc: "Für Unternehmen mit akutem Personalbedarf und dem Ziel, in kurzer Zeit mehr qualifizierte Kontakte zu erzeugen.", link: "/funnel/mechatroniker" },
  { title: "SPS-Programmierer (m/w/d)", desc: "Gezielte Ansprache spezialisierter Profile mit stärkerer Vorqualifizierung und klarer Positionierung.", link: "/funnel/sps-programmierer" },
  { title: "Elektriker (m/w/d)", desc: "Für Unternehmen, die regionale Fachkräfte schneller und planbarer in Gespräche bringen möchten.", link: "/funnel/elektriker" },
  { title: "Anlagenmechaniker SHK (m/w/d)", desc: "Für SHK-, TGA- und Serviceunternehmen mit akutem Bedarf an passenden Fachkräften.", link: "/funnel/anlagenmechaniker-shk" },
  { title: "Kältetechniker (m/w/d)", desc: "Für enge Fachmärkte, in denen klare Ansprache und schnelle Reaktion den Unterschied machen.", link: "/funnel/kaeltetechniker" },
];

const COMPARISON = [
  {
    bg: "#fef2f2",
    bd: "#fecaca",
    badgeBg: "#fee2e2",
    badgeColor: "#b91c1c",
    label: "Ohne System",
    title: "Anzeige online und hoffen",
    mark: "✕",
    markC: "#b91c1c",
    items: [
      "Keine klare Bewerberstrecke",
      "Zu viele Absprünge auf mobilen Geräten",
      "Kein strukturierter Bewerbungsweg",
      "Keine Vorqualifizierung",
      "Zu langsame Rückmeldung",
      "Potenzielle Bewerber gehen verloren",
    ],
  },
  {
    bg: C.accentBg,
    bd: C.accentBd,
    badgeBg: "#dbeafe",
    badgeColor: C.accentDk,
    label: "Mit System",
    title: "Gezielt zu mehr Gesprächen",
    mark: "✓",
    markC: C.accent,
    items: [
      "Klare Bewerberstrecke pro Vakanz",
      "Mobile Bewerbung in kurzer Zeit",
      "Gezielte Vorqualifizierung",
      "Schnellere Reaktion auf Anfragen",
      "Bessere Übersicht und mehr Kontrolle",
      "Mehr qualifizierte Gespräche",
    ],
  },
];

const PROCESS_STEPS = [
  ["01","Angebot definieren","Wir klären gemeinsam: Welche Stelle, welche Zielgruppe, welche Vorteile. Ein konkretes Angebot, nicht zehn offene Stellen."],
  ["02","Traffic aufsetzen","Meta Ads als Hauptkanal – mit definiertem Budget, regionaler Aussteuerung und berufsspezifischer Zielgruppe."],
  ["03","Funnel verbinden","Die Anzeige führt direkt auf Ihre Landingpage oder in einen WhatsApp-Chat. Kein Umweg, keine Ablenkung."],
  ["04","Bewerber vorqualifizieren","Per WhatsApp oder Mini-Formular mit 3–5 gezielten Fragen. Direkte, menschliche Kommunikation."],
  ["05","Konsequent nachfassen","Wer schnell reagiert, gewinnt. Ein strukturierter Reminder-Prozess sorgt dafür, dass keine Anfrage verloren geht."],
  ["06","Auswerten und skalieren","Was funktioniert, wird skaliert. Conversion-Raten und Lead-Qualität werden regelmäßig ausgewertet."],
];

const CASES = [
  { industry: "Elektrotechnik · NRW", title: "Elektriker gesucht", desc: "Typischer Zielwert eines fokussierten Funnels mit schnellem Follow-up und klarer Bewerberstrecke für gewerblich-technische Fachkräfte.", nums: [{ v: "27", l: "Bewerbungen" }, { v: "7", l: "Qualifiziert" }, { v: "2", l: "Einstellungen" }], delay: 0 },
  { industry: "Industrieanlagen · Rheinland", title: "Servicetechniker gesucht", desc: "Typische Zielwerte bei regionaler Aussteuerung, einfacher Vorqualifizierung und klarer Kommunikation im Funnel.", nums: [{ v: "22", l: "Bewerbungen" }, { v: "6", l: "Qualifiziert" }, { v: "2", l: "Einstellungen" }], delay: 0.1 },
  { industry: "Instandhaltung · Ruhrgebiet", title: "Mechatroniker gesucht", desc: "Typische Zielwerte eines strukturierten Recruiting-Funnels im Umfeld wiederkehrender Personalbedarfe.", nums: [{ v: "25", l: "Bewerbungen" }, { v: "8", l: "Qualifiziert" }, { v: "2", l: "Einstellungen" }], delay: 0.2 },
];

const BENEFITS = [
  ["01", "Zielgruppen-Landingpages", "Fokussierte Seiten für konkrete Vakanzen – keine generischen Karriereinhalte.", 0],
  ["02", "Mobile-first", "Optimiert für Kandidaten, die über das Smartphone kommen – der häufigste Kanal.", 0.06],
  ["03", "Einfache Bewerbung", "60 Sekunden, kein Lebenslauf, kein Aufwand – die Hürde ist minimal.", 0.12],
  ["04", "Vorqualifizierung", "Nur passendere Bewerber landen in Ihrem Prozess – kein unnötiges Sortieren.", 0.18],
  ["05", "Messbare Ergebnisse", "Conversion-Raten, Lead-Qualität und Besetzungszeit – alles transparent.", 0.24],
  ["06", "Schnell umsetzbar", "Kein Relaunch, kein langer Vorlauf. Das System ist innerhalb weniger Tage aktiv.", 0.3],
];

const LEGAL = {
  impressum: {
    title: "Impressum",
    body: [
      ["Angaben gemäß § 5 TMG", "PHE-Perm Engineering Ingenieure & Techniker GmbH, Hüttenstraße 30, 40215 Düsseldorf"],
      ["Vertreten durch", "Matin Askaryar"],
      ["Kontakt", "Telefon: 0211 15863100 · E-Mail: info@phe-perm.de"],
      ["Registereintrag", "Registergericht: Amtsgericht Düsseldorf · Registernummer: HRB 99512"],
      ["Umsatzsteuer-ID", "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE361209243"],
      ["Redaktionell verantwortlich", "Matin Askaryar · E-Mail: matin.askaryar@phe-perm.de · Telefon: 0211 15863100"],
      ["Verbraucherstreitbeilegung", "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."],
    ],
  },
  datenschutz: {
    title: "Datenschutzerklärung",
    body: [
      ["1. Verantwortlicher", "Matin Askaryar · PHE-Perm Engineering Ingenieure & Techniker GmbH · Hüttenstraße 30, 40215 Düsseldorf · info@phe-perm.de"],
      ["2. Erhebung personenbezogener Daten", "Daten werden erhoben, wenn Sie das Kontaktformular nutzen: Name, Unternehmen, E-Mail, Telefon, Nachricht. Rechtsgrundlage: Art. 6 Abs. 1 lit. b und lit. f DSGVO."],
      ["3. Formular-Verarbeitung", "Kontaktanfragen werden über eine technische Server-Schnittstelle verarbeitet, um Ihre Anfrage an uns zu übermitteln."],
      ["4. Server-Log-Dateien", "Der Hosting-Anbieter erfasst Zugriffsdaten. Eine Zusammenführung mit anderen Daten findet nicht statt."],
      ["5. Cookies", "Diese Website verwendet keine Tracking-Cookies oder Analyse-Tools."],
      ["6. Ihre Rechte", "Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Kontakt: info@phe-perm.de"],
    ],
  },
  agb: {
    title: "Allgemeine Geschäftsbedingungen",
    body: [
      ["§ 1 Geltungsbereich", "Diese AGB gelten für alle Verträge zwischen der PHE-Perm Engineering Ingenieure & Techniker GmbH und dem jeweiligen Auftraggeber über digitale Recruiting-Leistungen im Zusammenhang mit pheweb."],
      ["§ 2 Leistungsgegenstand", "pheweb erbringt Dienstleistungen im Bereich digitaler Recruiting-Lösungen, insbesondere Landingpages, Funnels, Bewerberstrecken und ergänzende Prozessunterstützung."],
      ["§ 3 Vertragsschluss", "Angebote sind freibleibend. Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung oder ausdrückliche Beauftragung zustande."],
      ["§ 4 Vergütung und Zahlung", "Rechnungen sind innerhalb von 14 Tagen ohne Abzug zahlbar, sofern nichts anderes schriftlich vereinbart wurde."],
      ["§ 5 Mitwirkungspflichten", "Der Auftraggeber stellt alle für die Umsetzung erforderlichen Informationen, Inhalte und Freigaben rechtzeitig zur Verfügung."],
      ["§ 6 Nutzungsrechte", "Nach vollständiger Zahlung erhält der Auftraggeber ein einfaches Nutzungsrecht an den im Rahmen des Auftrags erstellten Inhalten und Umsetzungen."],
      ["§ 7 Haftung", "Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit gesetzlich zulässig."],
      ["§ 8 Schlussbestimmungen", "Es gilt deutsches Recht. Gerichtsstand ist Düsseldorf, soweit gesetzlich zulässig."],
    ],
  },
};

// ── HOOKS ─────────────────────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); io.disconnect(); }
    }, { threshold: t });
    io.observe(el);
    return () => io.disconnect();
  }, [t]);
  return [ref, v];
}

function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ── BUTTON STYLES ─────────────────────────────────────────────────────────────
const Btn = { base: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer", fontWeight: 700, transition: "all 0.2s ease", borderRadius: 999, fontFamily: F, whiteSpace: "nowrap", textDecoration: "none", letterSpacing: "0.01em" } };
Btn.primary = { ...Btn.base, background: C.accent, color: "#fff", boxShadow: "0 4px 20px rgba(59,114,184,0.26)" };
Btn.outline  = { ...Btn.base, background: "#fff", color: C.text, border: `1.5px solid ${C.borderMd}`, boxShadow: C.shadow };
Btn.wa       = { ...Btn.base, background: C.wa, color: "#fff", boxShadow: "0 4px 18px rgba(34,197,94,0.24)" };
Btn.soft     = { ...Btn.base, background: C.accentBg, color: C.accent, border: `1px solid ${C.accentBd}` };

const wrap = { width: "min(1080px, calc(100% - 32px))", margin: "0 auto" };
const INP = { width: "100%", background: C.bgSoft, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "13px 16px", fontSize: 15, color: C.text, outline: "none", fontFamily: F, transition: "border 0.2s" };
const T = {
  eye:  { fontFamily: F, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: C.accent, marginBottom: 14 },
  h2:   { fontFamily: F, fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 800, color: C.text },
  h3:   { fontFamily: F, fontSize: "clamp(18px,2vw,22px)", lineHeight: 1.2, fontWeight: 700, color: C.text },
  lead: { fontFamily: F, fontSize: 17, lineHeight: 1.75, color: C.muted, maxWidth: 620, margin: "14px auto 0" },
  sm:   { fontFamily: F, fontSize: 13, color: C.faint, lineHeight: 1.6 },
};

// ── LEGAL OVERLAY ─────────────────────────────────────────────────────────────
function LegalOverlay({ page, onClose }) {
  if (!page) return null;
  const { title, body } = LEGAL[page];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: C.bg, overflowY: "auto" }}>
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "56px 24px 80px" }}>
        <button onClick={onClose} style={{ ...Btn.soft, padding: "9px 18px", fontSize: 14, marginBottom: 36, borderRadius: 10 }}>← Zurück</button>
        <h1 style={{ fontFamily: F, fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>{title}</h1>
        <p style={{ ...T.sm, marginBottom: 36 }}>Stand: März 2026</p>
        {body.map(([h, p]) => (
          <div key={h} style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{h}</h2>
            <p style={{ fontFamily: F, fontSize: 15, color: C.muted, lineHeight: 1.8 }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CARD COMPONENTS ───────────────────────────────────────────────────────────
function HoverCard({ children, style = {}, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#fff", border: `1.5px solid ${hov ? C.accentBd : C.border}`, borderRadius: 18, boxShadow: hov ? C.shadowLg : C.shadow, transform: hov ? "translateY(-4px)" : v ? "translateY(0)" : "translateY(20px)", opacity: v ? 1 : 0, transition: `all 0.25s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function StepCard({ n, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#fff", border: `1.5px solid ${hov ? C.accentBd : C.border}`, borderRadius: 18, padding: "26px 22px", textAlign: "left", boxShadow: hov ? C.shadowMd : C.shadow, transition: "all 0.25s ease", transform: hov ? "translateY(-4px)" : v ? "translateY(0)" : "translateY(20px)", opacity: v ? 1 : 0, transitionDelay: v ? `${delay}s` : "0s", height: "100%" }}>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: C.accentBg, border: `1px solid ${C.accentBd}`, fontFamily: F, fontSize: 14, fontWeight: 800, color: C.accent, marginBottom: 16 }}>{n}</div>
      <h3 style={{ ...T.h3, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
}

function GearCard({ n, sub, title, desc, tags, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#fff", border: `1.5px solid ${hov ? C.accentBd : C.border}`, borderRadius: 18, padding: "24px 20px", position: "relative", overflow: "hidden", boxShadow: hov ? C.shadowLg : C.shadow, transition: "all 0.25s ease", transform: hov ? "translateY(-5px)" : v ? "translateY(0)" : "translateY(20px)", opacity: v ? 1 : 0, transitionDelay: v ? `${delay}s` : "0s", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.accent, transform: hov ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.25s ease" }} />
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: C.accentBg, border: `1px solid ${C.accentBd}`, fontFamily: F, fontSize: 14, fontWeight: 800, color: C.accent, marginBottom: 14, alignSelf: "flex-start" }}>{n}</div>
      <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.accent, marginBottom: 6 }}>{sub}</div>
      <h3 style={{ ...T.h3, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 14, flex: 1 }}>{desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tags.map((t, i) => (
          <div key={i} style={{ background: i === 0 ? C.accentBg : C.bgSoft, border: `1px solid ${i === 0 ? C.accentBd : C.border}`, borderRadius: 8, padding: "7px 12px", fontFamily: F, fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? C.accentDk : C.muted }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

function CaseCard({ industry, title, desc, nums, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, v] = useInView();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#fff", border: `1.5px solid ${hov ? C.accentBd : C.border}`, borderRadius: 18, padding: 26, transition: "all 0.25s ease", transform: hov ? "translateY(-4px)" : v ? "translateY(0)" : "translateY(20px)", opacity: v ? 1 : 0, transitionDelay: v ? `${delay}s` : "0s", boxShadow: hov ? C.shadowLg : C.shadow }}>
      <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.faint, marginBottom: 8 }}>{industry}</div>
      <h3 style={{ ...T.h3, color: C.accentDk, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontFamily: F, fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>{desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {nums.map(({ v: val, l }) => (
          <div key={l} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
            <span style={{ display: "block", fontFamily: F, fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 4 }}>{val}</span>
            <span style={{ fontFamily: F, fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ num, label, delay }) {
  const [ref, v] = useInView();
  const isRange = num.includes("–");
  const target = parseInt(num.replace(/\D/g, "")) || 0;
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!v || isRange) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1000, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), delay * 1000);
    return () => clearTimeout(t);
  }, [v, target, delay, isRange]);
  return (
    <div ref={ref} style={{ padding: "36px 24px", textAlign: "center", background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 18, boxShadow: C.shadow, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      <span style={{ fontFamily: F, fontSize: "clamp(40px,6vw,64px)", fontWeight: 800, color: C.accent, lineHeight: 1, display: "block", marginBottom: 10, letterSpacing: "-0.02em" }}>{isRange ? num : String(count)}</span>
      <div style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.65, maxWidth: 180, margin: "0 auto" }}>{label}</div>
    </div>
  );
}

function MobileMenu({ open, onClose, scrollTo }) {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}
    >
      <button
        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
        onClick={onClose}
        style={{ position: "absolute", top: 16, right: 16, background: C.accentBg, border: `1.5px solid ${C.accentBd}`, borderRadius: 12, padding: "12px 20px", cursor: "pointer", fontFamily: F, fontSize: 16, fontWeight: 700, color: C.accent, lineHeight: 1, WebkitTapHighlightColor: "transparent" }}
      >✕ Schließen</button>
      {NAV_ITEMS.map(([l, id]) => (
        <button
          key={id}
          onTouchEnd={(e) => { e.preventDefault(); scrollTo(id); onClose(); }}
          onClick={() => { scrollTo(id); onClose(); }}
          style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: C.text, background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.01em", padding: "8px 24px", WebkitTapHighlightColor: "transparent" }}
        >{l}</button>
      ))}
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{ ...Btn.wa, padding: "14px 32px", fontSize: 15, marginTop: 8 }}>Per WhatsApp anfragen</a>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const w = useWidth();
  const isMobile = w < 640;
  const isTablet = w < 900;
  const cols = (d, t, m) => (isMobile ? m : isTablet ? t : d);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalPage, setLegalPage] = useState(null);
  const [form, setForm] = useState({ name: "", unternehmen: "", email: "", telefon: "", positionen: "", kontaktweg: "", nachricht: "", website: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "9b89391f-fce9-4554-9fed-18d85fbad2df",
          subject: `Neue Anfrage von ${form.name.trim()} – pheweb.de`,
          name: form.name.trim(),
          unternehmen: form.unternehmen.trim(),
          email: form.email.trim(),
          telefon: form.telefon.trim(),
          positionen: form.positionen.trim(),
          kontaktweg: form.kontaktweg,
          nachricht: form.nachricht.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ name: "", unternehmen: "", email: "", telefon: "", positionen: "", kontaktweg: "", nachricht: "", website: "" });
      } else {
        setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
        body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#fff;overflow-x:hidden;color:#0f1623}
        a{color:inherit;text-decoration:none}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .ha{animation:heroIn 0.5s 0.08s ease both}
        .hb{animation:heroIn 0.55s 0.16s ease both}
        .hc{animation:heroIn 0.55s 0.24s ease both}
        .hd{animation:heroIn 0.55s 0.32s ease both}
        .he{animation:heroIn 0.55s 0.40s ease both}
        .hf{animation:heroIn 0.65s 0.48s ease both}
        .mq{display:flex;animation:marquee 30s linear infinite}
        .mq:hover{animation-play-state:paused}
        .lift:hover{transform:translateY(-2px)!important;filter:brightness(1.03)}
        input:focus,textarea:focus,select:focus{border-color:rgba(59,114,184,0.4)!important;box-shadow:0 0 0 3px rgba(59,114,184,0.09)!important;outline:none}
      `}</style>

      <LegalOverlay page={legalPage} onClose={() => setLegalPage(null)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} scrollTo={scrollTo} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(255,255,255,0.94)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? `1px solid ${C.border}` : "none", boxShadow: scrolled ? "0 1px 16px rgba(59,114,184,0.06)" : "none", transition: "all 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: isMobile ? "15px 18px" : "16px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontFamily: FH, fontSize: isMobile ? 20 : 24, letterSpacing: "-0.02em", color: C.text, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            phe<em style={{ fontStyle: "italic", color: C.accent }}>web</em>
          </div>
          {!isTablet && (
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {NAV_ITEMS.map(([l, id]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: C.muted, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}>{l}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!isMobile && <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...Btn.primary, padding: "9px 20px", fontSize: 13.5 }}>Analyse anfragen</button>}
            {isTablet && <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: `1.5px solid ${C.borderMd}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: F, fontSize: 20, color: C.text }}>☰</button>}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: isMobile ? 108 : 136, paddingBottom: isMobile ? 56 : 96, background: C.bg, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(59,114,184,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={wrap}>
          <div className="ha" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentBg, border: `1px solid ${C.accentBd}`, color: C.accent, borderRadius: 999, padding: "7px 16px", fontFamily: F, fontSize: 13, fontWeight: 600, marginBottom: 28, letterSpacing: "0.01em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
            Recruiting-System · Mittelstand &amp; Industrie
          </div>
          <h1 className="hb" style={{ fontFamily: FH, fontSize: "clamp(40px,7vw,76px)", lineHeight: 1.04, letterSpacing: "-0.03em", fontWeight: 400, color: C.text, marginBottom: 18 }}>
            Mehr qualifizierte Bewerber<br /><em style={{ fontStyle: "italic", color: C.accent }}>für Ihre offenen Stellen.</em>
          </h1>
          <div className="hc" style={{ maxWidth: 900, margin: "0 auto 18px" }}>
            <p style={{ fontFamily: F, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.6, color: C.text, fontWeight: 700 }}>
              Ohne Website-Relaunch. Ohne komplizierten Prozess. Ohne mehr Aufwand für Ihr Team.
            </p>
          </div>
          <p className="hd" style={{ ...T.lead, fontSize: "clamp(15px,2vw,18px)", margin: "0 auto 36px", maxWidth: 760 }}>
            Wir bauen Recruiting-Funnels für Unternehmen aus Industrie und Mittelstand, die aus Klicks qualifizierte Bewerbungen machen – von der Anzeige bis zum Follow-up.
          </p>
          <div className="he" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...Btn.primary, padding: isMobile ? "14px 22px" : "15px 34px", fontSize: 15, width: isMobile ? "100%" : "auto" }}>Kostenlose Analyse anfragen</button>
            <button onClick={() => scrollTo("beispiel-funnels")} className="lift" style={{ ...Btn.outline, padding: isMobile ? "14px 22px" : "15px 34px", fontSize: 15, width: isMobile ? "100%" : "auto" }}>Beispiel-Funnel ansehen</button>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={{ ...Btn.wa, padding: isMobile ? "14px 22px" : "15px 34px", fontSize: 15, width: isMobile ? "100%" : "auto" }}>Per WhatsApp anfragen</a>
          </div>
          <div className="hf" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {HERO_TRUST.map((t, i) => (
              <span key={i} style={{ fontFamily: F, fontSize: 13, color: C.faint, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <span style={{ color: C.border }}>|</span>}{t}
              </span>
            ))}
          </div>
          {!isMobile && (
            <div className="hf" style={{ marginTop: 56, maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
              <div style={{ background: "#fff", border: `1px solid ${C.borderMd}`, borderRadius: 22, boxShadow: C.shadowLg, overflow: "hidden" }}>
                <div style={{ background: C.bgSoft, padding: "11px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 5 }}>{["#ff6b6b","#ffd93d","#6bcb77"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}</div>
                  <div style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 14px", fontFamily: "monospace", fontSize: 12, color: C.faint, textAlign: "center" }}>pheweb.de/elektriker-nrw</div>
                  <div style={{ width: 50 }} />
                </div>
                <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, textAlign: "left" }}>
                  <div>
                    <div style={{ display: "inline-flex", background: C.accentBg, color: C.accent, borderRadius: 999, padding: "4px 12px", fontFamily: F, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Schnellbewerbung</div>
                    <div style={{ fontFamily: F, fontSize: 22, fontWeight: 800, lineHeight: 1.15, color: C.text, marginBottom: 14, letterSpacing: "-0.01em" }}>Elektroniker (m/w/d)<br />gesucht – NRW</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                      {[["Gehalt","48 – 58 T€"],["Firmenwagen","Inkl. privat"],["Bewerbung","Ohne Lebenslauf"],["Dauer","60 Sekunden"]].map(([l,v]) => (
                        <div key={l} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px" }}>
                          <div style={{ fontFamily: F, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.09em", color: C.faint, fontWeight: 700, marginBottom: 3 }}>{l}</div>
                          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Jetzt bewerben</div>
                      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontFamily: F, fontSize: 13, color: C.faint, marginBottom: 8 }}>Vorname &amp; Nachname</div>
                      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontFamily: F, fontSize: 13, color: C.faint, marginBottom: 10 }}>Telefonnummer</div>
                      <div style={{ background: C.accent, color: "#fff", borderRadius: 8, padding: 10, fontFamily: F, fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 7 }}>Bewerbung absenden</div>
                      <a href={WA_BEW} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: C.wa, color: "#fff", borderRadius: 8, padding: 10, fontFamily: F, fontSize: 13, fontWeight: 700, textAlign: "center" }}>Per WhatsApp bewerben</a>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ background: `linear-gradient(135deg,${C.accent} 0%,#5b8fd4 100%)`, borderRadius: 14, padding: "18px 14px", color: "#fff", textAlign: "center" }}>
                      <span style={{ display: "block", fontFamily: F, fontSize: 34, fontWeight: 800, lineHeight: 1, marginBottom: 4, letterSpacing: "-0.02em" }}>+38%</span>
                      <span style={{ fontFamily: F, fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Conversion-Rate</span>
                    </div>
                    {[["60s","Bewerbzeit"],["25","Bewerbungen / 30 Tage"]].map(([v,l]) => (
                      <div key={l} style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentBg, border: `1px solid ${C.accentBd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: F, fontSize: 16, fontWeight: 700, color: C.accent }}>→</div>
                        <div>
                          <div style={{ fontFamily: F, fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 2 }}>{v}</div>
                          <div style={{ fontFamily: F, fontSize: 11, color: C.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
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

      {/* MARQUEE */}
      <div style={{ padding: "22px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.bgSoft, overflow: "hidden" }}>
        <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.faint, textAlign: "center", marginBottom: 16 }}>Geeignet für Unternehmen mit akutem Personalbedarf</div>
        <div className="mq">
          {[...INDUSTRIES,...INDUSTRIES].map((item,i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "8px 22px", margin: "0 6px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 999, fontFamily: F, fontSize: 14, fontWeight: 600, color: C.muted, whiteSpace: "nowrap", boxShadow: "0 1px 4px rgba(59,114,184,0.05)", flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.accentBd, marginRight: 10, display: "inline-block" }} />{item}
            </span>
          ))}
        </div>
      </div>

      {/* ANGEBOT */}
      <section id="angebot" style={{ background: "#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Angebot</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Sie haben offene Stellen. <span style={{ color: C.accent }}>Wir bauen das System, das Ihnen Bewerber liefert.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Viele Unternehmen schalten Stellenanzeigen und warten. Genau das ist das Problem. Ohne klare Bewerberstrecke, mobile Optimierung, Vorqualifizierung und schnelles Follow-up gehen potenzielle Kandidaten verloren, bevor überhaupt ein Gespräch entsteht.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48, maxWidth: 860, marginLeft: "auto", marginRight: "auto" }}>
            {OFFER_PACKAGES.map((p, pi) => (
              <FadeUp key={pi} delay={pi * 0.12} style={{ height: "100%" }}>
                <div style={{ background: p.featured ? C.accentBg : "#fff", border: `1.5px solid ${p.featured ? C.accent : C.border}`, borderRadius: 20, padding: isMobile ? 24 : 34, textAlign: "left", height: "100%", display: "flex", flexDirection: "column" }}>
                  {p.badge && <div style={{ display: "inline-block", background: C.accent, color: "#fff", borderRadius: 999, padding: "4px 14px", fontFamily: F, fontSize: 12, fontWeight: 700, marginBottom: 14, alignSelf: "flex-start" }}>{p.badge}</div>}
                  <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.faint, marginBottom: 8 }}>{p.type}</div>
                  <div style={{ fontFamily: F, fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 4, letterSpacing: "-0.02em" }}>{p.price}</div>
                  <div style={{ fontFamily: F, fontSize: 13, color: C.faint, marginBottom: 18 }}>{p.hint}</div>
                  <div style={{ height: 1, background: C.border, margin: "0 0 18px" }} />
                  <div style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>{p.desc}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 24, flex: 1 }}>
                    {p.items.map((item, ii) => (
                      <li key={ii} style={{ display: "flex", gap: 10, fontFamily: F, fontSize: 14, color: C.muted, alignItems: "flex-start", lineHeight: 1.6 }}>
                        <span style={{ color: C.accent, fontSize: 14, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>→</span>{item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...Btn[p.btn], width: "100%", borderRadius: 12, padding: "13px 20px" }}>{p.cta}</button>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <div style={{ maxWidth: 760, margin: "20px auto 0", padding: 16, background: C.accentBg, border: `1px solid ${C.accentBd}`, borderRadius: 12, fontFamily: F, fontSize: 14, color: C.muted, fontStyle: "italic", lineHeight: 1.65, textAlign: "center" }}>
              Ihre bestehende Website bleibt, wie sie ist. Wir ergänzen sie um einen klaren Recruiting-Prozess, der aus Aufmerksamkeit echte Bewerbungen macht.
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SYSTEM / STATS */}
      <section id="system" style={{ background: C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Das Problem</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Warum klassische Stellenanzeigen oft <span style={{ color: C.accent }}>nicht genug bringen</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Eine offene Stelle allein erzeugt noch keine Bewerbungen. Die meisten Unternehmen verlieren Interessenten an denselben Punkten: unklare Ansprache, zu lange Prozesse, schlechte mobile Darstellung und fehlendes Nachfassen.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr 1fr", "1fr 1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {STATS.map((s) => <StatCard key={s.label} num={s.num} label={s.label} delay={s.delay} />)}
          </div>
          <FadeUp delay={0.72}>
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <p style={{ fontFamily: F, fontSize: 15, color: C.muted, marginBottom: 14 }}>Offene Stelle, aber zu wenig Bewerbungen?</p>
              <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...Btn.primary, padding: "13px 24px", fontSize: 14 }}>Jetzt prüfen lassen</button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 4 BAUSTEINE */}
      <section style={{ background: "#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Die 4 Bausteine</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Vier Bausteine. <span style={{ color: C.accent }}>Ein Ziel: mehr qualifizierte Bewerbungen.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Ein Recruiting-Funnel funktioniert nicht, weil eine einzelne Landingpage gut aussieht. Er funktioniert, wenn alle vier Bausteine ineinandergreifen und Bewerber sauber durch den Prozess führen.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr 1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {GEAR_ITEMS.map((g, i) => <GearCard key={g.n} {...g} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* BEISPIEL FUNNELS */}
      <section id="beispiel-funnels" style={{ background: C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Beispiel-Funnels</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>So kann ein Recruiting-Funnel <span style={{ color: C.accent }}>für Ihre Vakanz aussehen.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Nicht theoretisch. Nicht kompliziert. Sondern klar, direkt und auf eine konkrete Stelle ausgerichtet.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {EXAMPLE_FUNNELS.map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.06}>
                <div style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 18, padding: 24, boxShadow: C.shadow, textAlign: "left", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: C.accentBg, border: `1px solid ${C.accentBd}`, fontFamily: F, fontSize: 14, fontWeight: 800, color: C.accent, marginBottom: 16 }}>0{i + 1}</div>
                  <h3 style={{ ...T.h3, marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 18, flex: 1 }}>{item.desc}</p>
                  <Link to={item.link} className="lift" style={{ ...Btn.outline, width: "100%", borderRadius: 12, padding: "13px 18px", fontSize: 14, textAlign: "center" }}>Funnel ansehen</Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* VERGLEICH */}
      <section id="vergleich" style={{ background: "#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Der Unterschied</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Der Unterschied zwischen Stellenanzeige <span style={{ color: C.accent }}>und Recruiting-System.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Die meisten Unternehmen verlieren qualifizierte Bewerber, bevor diese überhaupt das Bewerbungsformular öffnen.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {COMPARISON.map((c, ci) => (
              <FadeUp key={ci} delay={ci * 0.12}>
                <div style={{ borderRadius: 20, padding: isMobile ? 24 : 34, background: c.bg, border: `1.5px solid ${c.bd}`, height: "100%", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", fontFamily: F, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "5px 14px", borderRadius: 999, marginBottom: 16, background: c.badgeBg, color: c.badgeColor }}>{c.label}</div>
                  <h3 style={{ ...T.h3, marginBottom: 22, fontSize: "clamp(18px,2.5vw,24px)" }}>{c.title}</h3>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, textAlign: "left" }}>
                    {c.items.map((item, ii) => (
                      <li key={ii} style={{ display: "flex", gap: 11, fontFamily: F, fontSize: 15, color: C.muted, lineHeight: 1.65, alignItems: "flex-start" }}>
                        <span style={{ color: c.markC, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>{c.mark}</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* PROZESS */}
      <section id="prozess" style={{ background: C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Unser Vorgehen</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>In 6 Schritten zu <span style={{ color: C.accent }}>mehr qualifizierten Bewerbungen.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Jeder Schritt baut auf dem vorherigen auf. Kein unnötiger Ballast, kein komplizierter Relaunch – sondern ein klarer Weg von der offenen Stelle bis zum qualifizierten Gespräch.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {PROCESS_STEPS.map(([n, t, d], i) => (
              <FadeUp key={n} delay={i * 0.07}><StepCard n={n} title={t} desc={d} delay={0} /></FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CASES */}
      <section style={{ background: "#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Typische Zielwerte</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Was mit einem sauberen Funnel <span style={{ color: C.accent }}>realistisch möglich ist.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 780 }}>Die genauen Ergebnisse hängen von Position, Region, Arbeitgeberattraktivität und Werbebudget ab. Typische Zielwerte eines strukturierten Recruiting-Funnels im gewerblich-technischen Umfeld sind jedoch klar messbar.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {CASES.map((c) => <CaseCard key={c.title} {...c} />)}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ background: C.bgSoft, padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Was Sie bekommen</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Ein System, das <span style={{ color: C.accent }}>messbar funktioniert.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>Ihre bestehende Website bleibt unverändert. Wir ergänzen sie um ein Bewerbersystem, das auf Ergebnisse ausgelegt ist.</p></FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: cols("1fr 1fr 1fr", "1fr 1fr", "1fr"), gap: 16, marginTop: 48 }}>
            {BENEFITS.map(([n, title, desc, delay]) => (
              <HoverCard key={title} delay={delay} style={{ padding: "24px 22px", textAlign: "left" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: C.accentBg, border: `1px solid ${C.accentBd}`, fontFamily: F, fontSize: 14, fontWeight: 800, color: C.accent, marginBottom: 16 }}>{n}</div>
                <h4 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, marginBottom: 8, color: C.text }}>{title}</h4>
                <p style={{ fontFamily: F, fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.accentBg, borderTop: `1px solid ${C.accentBd}`, borderBottom: `1px solid ${C.accentBd}`, padding: isMobile ? "64px 0" : "96px 0", textAlign: "center" }}>
        <div style={wrap}>
          <FadeUp><span style={T.eye}>Nächster Schritt</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Lassen Sie uns prüfen, ob sich Ihre offene Stelle <span style={{ color: C.accent }}>für einen Recruiting-Funnel eignet.</span></h2></FadeUp>
          <FadeUp delay={0.2}><p style={{ ...T.lead, maxWidth: 760 }}>In einer kurzen Erstaufnahme besprechen wir Ihre Vakanz, die Zielgruppe und die aktuelle Situation. Danach sehen Sie klar, ob und wie ein Funnel für Ihr Unternehmen sinnvoll aufgebaut werden kann.</p></FadeUp>
          <FadeUp delay={0.3}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
              <button onClick={() => scrollTo("kontakt")} className="lift" style={{ ...Btn.primary, padding: isMobile ? "14px 22px" : "15px 34px", fontSize: 15, width: isMobile ? "100%" : "auto" }}>Kostenlose Analyse anfragen</button>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={{ ...Btn.wa, padding: isMobile ? "14px 22px" : "15px 34px", fontSize: 15, width: isMobile ? "100%" : "auto" }}>Per WhatsApp schreiben</a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* KONTAKT */}
      <section id="kontakt" style={{ background: "#fff", padding: isMobile ? "64px 0" : "96px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <FadeUp><span style={T.eye}>Kontakt</span></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ ...T.h2, marginBottom: 14 }}>Schreiben Sie uns. <span style={{ color: C.accent }}>Wir melden uns innerhalb von 24 Stunden.</span></h2></FadeUp>
          <FadeUp delay={0.15}><p style={{ ...T.lead, maxWidth: 760, marginBottom: 12 }}>Wenn Sie aktuell offene Stellen haben und mehr qualifizierte Bewerbungen benötigen, prüfen wir gerne gemeinsam mit Ihnen den passenden nächsten Schritt.</p></FadeUp>
          <FadeUp delay={0.2} style={{ maxWidth: 680, margin: "36px auto 0" }}>
            <div style={{ background: "#fff", border: `1.5px solid ${C.borderMd}`, borderRadius: 22, padding: isMobile ? "22px 16px" : "40px 36px", boxShadow: C.shadowLg }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                {["Per E-Mail anfragen", "Per WhatsApp erreichbar", "Antwort innerhalb 24h"].map((t) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", padding: "7px 14px", borderRadius: 999, background: C.bgSoft, border: `1px solid ${C.border}`, fontFamily: F, fontSize: 13, color: C.muted, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
              {sent ? (
                <div style={{ padding: "36px 16px", textAlign: "center" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.accentBg, border: `2px solid ${C.accentBd}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontFamily: F, fontSize: 26, color: C.accent, fontWeight: 700 }}>✓</div>
                  <h3 style={{ fontFamily: F, fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.01em" }}>Anfrage erhalten</h3>
                  <p style={{ fontFamily: F, color: C.muted, fontSize: 16 }}>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input type="text" name="website" autoComplete="off" tabIndex="-1" value={form.website} onChange={setF("website")} style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} />
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <input style={INP} placeholder="Vor- und Nachname" required value={form.name} onChange={setF("name")} maxLength={120} />
                    <input style={INP} placeholder="Unternehmen" required value={form.unternehmen} onChange={setF("unternehmen")} maxLength={160} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <input style={INP} type="email" placeholder="E-Mail-Adresse" required value={form.email} onChange={setF("email")} maxLength={160} />
                    <input style={INP} type="tel" placeholder="Telefonnummer" required value={form.telefon} onChange={setF("telefon")} maxLength={50} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <input style={INP} placeholder="Welche Positionen besetzen Sie?" value={form.positionen} onChange={setF("positionen")} maxLength={200} />
                    <select style={INP} value={form.kontaktweg} onChange={setF("kontaktweg")}>
                      <option value="">Bevorzugter Kontaktweg</option>
                      <option>Telefon</option><option>E-Mail</option><option>WhatsApp</option>
                    </select>
                  </div>
                  <textarea style={{ ...INP, minHeight: 100, resize: "vertical", display: "block", marginBottom: 10, lineHeight: 1.6 }} placeholder="Was sind Ihre größten Herausforderungen im Recruiting?" required value={form.nachricht} onChange={setF("nachricht")} maxLength={3000} />
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                    <button type="submit" disabled={sending} className="lift" style={{ ...Btn.primary, width: "100%", borderRadius: 12, padding: "14px 20px", opacity: sending ? 0.75 : 1, cursor: sending ? "not-allowed" : "pointer" }}>{sending ? "Wird gesendet..." : "Analyse anfragen"}</button>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="lift" style={{ ...Btn.wa, width: "100%", borderRadius: 12, padding: "14px 20px" }}>Per WhatsApp schreiben</a>
                  </div>
                  {error && <p style={{ marginTop: 10, fontFamily: F, fontSize: 13, color: C.red, textAlign: "center" }}>{error}</p>}
                  <p style={{ marginTop: 14, fontFamily: F, fontSize: 12.5, color: C.faint, lineHeight: 1.65, textAlign: "center" }}>
                    Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Bearbeitung Ihrer Anfrage zu.{" "}
                    {[["Datenschutz","datenschutz"],["Impressum","impressum"],["AGB","agb"]].map(([l,id],i) => (
                      <span key={id}>{i > 0 && " · "}<button type="button" onClick={() => setLegalPage(id)} style={{ fontFamily: F, color: C.accent, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}>{l}</button></span>
                    ))}
                  </p>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, padding: "44px 0 28px" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <div style={{ fontFamily: FH, fontSize: 22, color: C.text, marginBottom: 10 }}>phe<em style={{ fontStyle: "italic", color: C.accent }}>web</em></div>
          <p style={{ fontFamily: F, fontSize: 14, color: C.faint, marginBottom: 22, lineHeight: 1.8 }}>
            Recruiting-Funnels für Unternehmen aus Industrie und Mittelstand mit akutem Personalbedarf.<br />
            Matin Askaryar · PHE-Perm Engineering Ingenieure &amp; Techniker GmbH<br />
            Hüttenstraße 30, 40215 Düsseldorf
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", justifyContent: "center", marginBottom: 22 }}>
            {[["Impressum","impressum"],["Datenschutz","datenschutz"],["AGB","agb"]].map(([l,id]) => (
              <button key={id} onClick={() => setLegalPage(id)} style={{ fontFamily: F, fontSize: 14, color: C.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{l}</button>
            ))}
          </div>
          <div style={{ paddingTop: 18, borderTop: `1px solid ${C.border}`, fontFamily: F, fontSize: 13, color: C.faint }}>© 2026 pheweb</div>
        </div>
      </footer>
    </>
  );
}
