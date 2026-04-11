import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const C = {
  bg: "#F7F5F2",
  bgDark: "#1A1816",
  bgSection: "#EEEAE4",
  gold: "#B8955A",
  goldLight: "#D4B07E",
  goldBg: "rgba(184,149,90,0.09)",
  goldBorder: "rgba(184,149,90,0.28)",
  stone: "#857E75",
  text: "#1A1816",
  muted: "#5C5650",
  faint: "#9E9890",
  border: "rgba(26,24,22,0.10)",
  white: "#FFFFFF",
  shadow: "0 2px 20px rgba(26,24,22,0.07)",
  shadowMd: "0 8px 40px rgba(26,24,22,0.11)",
  shadowLg: "0 24px 80px rgba(26,24,22,0.15)",
};

const F = "'Bricolage Grotesque', 'Helvetica Neue', sans-serif";
const FH = "'DM Serif Display', Georgia, serif";

const WA_URL =
  "https://wa.me/491739980100?text=Hallo%2C%20ich%20interessiere%20mich%20f%C3%BCr%20ein%20Grundst%C3%BCck%20in%20der%20T%C3%BCrkei%20und%20m%C3%B6chte%20mehr%20erfahren.";

const WHY_CARDS = [
  {
    num: "I",
    title: "Attraktive Einstiegspreise",
    body: "Grundstücke bereits ab €18.000, ein Bruchteil vergleichbarer europäischer Lagen – idealer Einstieg in den Mittelmeermarkt.",
  },
  {
    num: "II",
    title: "Dynamischer Wachstumsmarkt",
    body: "Die Immobilienpreise an der türkischen Küste stiegen in den letzten 5 Jahren im Schnitt um 60% – mit weiter steigender Tendenz.",
  },
  {
    num: "III",
    title: "Rechtliche Sicherheit",
    body: "Ausländer dürfen in der Türkei Grundstücke kaufen. Wir begleiten Sie durch den gesamten Notarprozess – sicher und transparent.",
  },
  {
    num: "IV",
    title: "Citizenship by Investment",
    body: "Ab einem Investitionsvolumen von $400.000 erhalten Sie die türkische Staatsbürgerschaft – mit allen damit verbundenen Reisevorteilen.",
  },
  {
    num: "V",
    title: "Mediterranes Klima",
    body: "300 Sonnentage, warme Winter, kristallklares Meer – Leben Sie dort, wo andere Urlaub machen.",
  },
  {
    num: "VI",
    title: "Keine Doppelbesteuerung",
    body: "Dank des deutsch-türkischen Doppelbesteuerungsabkommens zahlen Sie keine doppelte Steuer auf Ihre Investition.",
  },
];

const REGIONS = [
  {
    name: "Antalya & Alanya",
    gradient: "linear-gradient(175deg, #0d4f6b 0%, #2a7f8c 35%, #c9a96e 70%, #8b6340 100%)",
    desc: "Die bekannteste Ferienregion der Türkei. Hervorragende Infrastruktur, internationaler Flughafen, ganzjährig beliebt.",
  },
  {
    name: "Bodrum Halbinsel",
    gradient: "linear-gradient(175deg, #0a2744 0%, #154f8a 40%, #c4bfa8 75%, #d9c99e 100%)",
    desc: "Exklusivste Region der Ägäis. Beliebt bei internationalen Investoren, einzigartiges Flair, stark steigende Preise.",
  },
  {
    name: "Ägäisküste / Izmir",
    gradient: "linear-gradient(175deg, #081e3f 0%, #1a4a7a 45%, #8ab4c9 75%, #b8d4e0 100%)",
    desc: "Kosmopolitische Stadt, ideal für Langzeit-Aufenthalte, hervorragende Anbindung an Europa.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Kostenloses Beratungsgespräch",
    desc: "Wir lernen Ihre Wünsche kennen: Lage, Budget, Nutzungsart. Per WhatsApp, Telefon oder Video-Call.",
  },
  {
    n: "02",
    title: "Grundstücksauswahl & Besichtigung",
    desc: "Wir zeigen Ihnen passende Objekte und organisieren auf Wunsch eine Vor-Ort-Besichtigung in der Türkei.",
  },
  {
    n: "03",
    title: "Rechtliche Prüfung & Notar",
    desc: "Unser türkischer Partneranwalt prüft alle Dokumente. Katasteramt-Eintrag, TAPU-Urkunde, alles inkl.",
  },
  {
    n: "04",
    title: "Eigentumsübertragung",
    desc: "Sie werden offizieller Grundstückseigentümer. Wir begleiten Sie bis zur letzten Unterschrift.",
  },
];

const FAQS = [
  {
    q: "Dürfen Deutsche Staatsangehörige Grundstücke in der Türkei kaufen?",
    a: "Ja. Seit 2003 dürfen EU-Bürger, darunter auch Deutsche, Grundstücke und Immobilien in der Türkei erwerben. Es gelten lediglich bestimmte Einschränkungen in Militärsperrgebieten, die wir im Vorfeld für Sie prüfen.",
  },
  {
    q: "Wie hoch sind die Kaufnebenkosten?",
    a: "Beim Grundstückskauf in der Türkei fällt eine Grunderwerbsteuer (Tapu Harcı) von 4% des Kaufpreises an. Hinzu kommen Notarkosten und Anwaltshonorar, i.d.R. 1–2% des Kaufpreises. Wir erstellen Ihnen eine vollständige Kostenkalkulation.",
  },
  {
    q: "Wie lange dauert der Kaufprozess?",
    a: "Von der Entscheidung bis zur eingetragenen TAPU-Urkunde (türkischer Grundbucheintrag) vergehen in der Regel 4 bis 8 Wochen. Bei vollständigen Unterlagen ist auch eine Abwicklung in 3 Wochen möglich.",
  },
  {
    q: "Kann ich das Grundstück aus Deutschland kaufen, ohne hinzureisen?",
    a: "Ja. Mit einer notariell beglaubigten Vollmacht können unsere Partner vor Ort den Kaufprozess in Ihrem Namen abwickeln. Viele unserer Kunden haben ihr Grundstück zunächst digital besichtigt und die Vollmacht bei einem deutschen Notar erteilt.",
  },
  {
    q: "Was ist die TAPU-Urkunde?",
    a: "Die TAPU ist das offizielle türkische Grundbuchdokument und entspricht dem deutschen Grundbucheintrag. Mit der TAPU sind Sie als rechtmäßiger Eigentümer beim türkischen Katasteramt registriert.",
  },
  {
    q: "Muss ich Steuern in Deutschland zahlen?",
    a: "Das deutsch-türkische Doppelbesteuerungsabkommen verhindert eine doppelte Besteuerung. Für die Details empfehlen wir eine individuelle steuerliche Beratung, die wir auf Wunsch vermitteln.",
  },
];

const STATS_DATA = [
  { num: "50+", label: "Grundstücke verfügbar" },
  { num: "8%", label: "Ø jährl. Wertsteigerung" },
  { num: "300", label: "Sonnentage im Jahr" },
  { num: "4–8 Wo.", label: "bis zur Eigentumsübertragung" },
];

export default function TurkeyLandPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function loadGallery() {
      try {
        const { data } = await supabaseClient
          .from("land_gallery")
          .select("*")
          .order("created_at", { ascending: false });
        setGallery(data || []);
      } catch {
        setGallery([]);
      } finally {
        setGalleryLoading(false);
      }
    }
    loadGallery();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: F, background: C.bg, color: C.text, overflowX: "hidden" }}>
      {/* Global styles injected */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        ::selection { background: rgba(184,149,90,0.25); }
        .turkey-btn-wa:hover { opacity: 0.88 !important; transform: translateY(-1px) !important; }
        .turkey-nav-link:hover { color: ${C.gold} !important; }
        .turkey-region-card:hover .turkey-region-btn { background: ${C.gold} !important; color: ${C.white} !important; }
        .turkey-faq-item:hover { border-color: ${C.goldBorder} !important; }
        .turkey-contact-card:hover { border-color: ${C.goldBorder} !important; background: rgba(184,149,90,0.05) !important; transform: translateY(-2px) !important; }
        .turkey-gallery-item { break-inside: avoid; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 20px" : "0 60px",
          height: 72,
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(247,245,242,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          boxShadow: scrolled ? "0 1px 0 rgba(26,24,22,0.08), 0 4px 24px rgba(26,24,22,0.06)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        }}
      >
        {/* Logo */}
        <a
          href="/grundstuecke"
          style={{
            fontFamily: FH,
            fontSize: 22,
            color: C.gold,
            letterSpacing: "0.06em",
            fontWeight: 400,
          }}
        >
          AR·ARAZI
        </a>

        {/* Center nav links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
            {[
              ["Warum Türkei", "warum"],
              ["Regionen", "regionen"],
              ["Prozess", "prozess"],
              ["Kontakt", "kontakt"],
            ].map(([label, id]) => (
              <button
                key={id}
                className="turkey-nav-link"
                onClick={() => scrollTo(id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: F,
                  fontSize: 14,
                  fontWeight: 500,
                  color: scrolled ? C.muted : "rgba(247,245,242,0.75)",
                  letterSpacing: "0.02em",
                  transition: "color 0.2s",
                  padding: "4px 0",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="turkey-btn-wa"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.gold,
            color: C.white,
            padding: "10px 20px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.02em",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {isMobile ? "WhatsApp" : "Kostenlos beraten"}
        </a>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          background: C.bgDark,
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: 72,
        }}
      >
        {/* Background grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(184,149,90,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(184,149,90,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 1400,
            margin: "0 auto",
            padding: isMobile ? "80px 24px 60px" : "0 60px",
            alignItems: "center",
            gap: 60,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Left: content */}
          <div style={{ flex: "0 0 60%", maxWidth: isMobile ? "100%" : "60%" }}>
            {/* Label */}
            <div
              style={{
                fontFamily: F,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: C.gold,
                textTransform: "uppercase",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ width: 32, height: 1, background: C.gold }} />
              GRUNDSTÜCKE · TÜRKEI
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: FH,
                fontSize: isMobile ? 52 : 84,
                fontWeight: 400,
                color: C.white,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                marginBottom: 28,
              }}
            >
              Ihr Grundstück
              <br />
              an der türkischen
              <br />
              <span style={{ color: C.gold, fontStyle: "italic" }}>Riviera.</span>
            </h1>

            {/* Sub */}
            <p
              style={{
                fontSize: 18,
                color: C.stone,
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: 44,
              }}
            >
              Wir verbinden deutsche Käufer mit geprüften Baugrundstücken
              direkt am Meer – rechtssicher und persönlich betreut.
            </p>

            {/* CTA Button */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="turkey-btn-wa"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: C.gold,
                color: C.white,
                padding: "18px 36px",
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.03em",
                transition: "all 0.2s",
                marginBottom: 44,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Jetzt kostenlos beraten lassen
            </a>

            {/* Trust row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                flexWrap: "wrap",
                rowGap: 8,
              }}
            >
              {["50+ Grundstücke", "Rechtlich geprüft", "Vor-Ort-Betreuung"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: C.gold,
                        margin: "0 16px",
                      }}
                    />
                  )}
                  <span style={{ fontSize: 13, color: C.faint, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: decorative element */}
          {!isMobile && (
            <div
              style={{
                flex: "0 0 40%",
                maxWidth: "40%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: 480,
              }}
            >
              {/* Outer gold frame */}
              <div
                style={{
                  position: "absolute",
                  width: 340,
                  height: 420,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: 2,
                  top: 20,
                  right: 0,
                }}
              />
              {/* Inner landscape box */}
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 380,
                  background: "linear-gradient(180deg, #1a3a5c 0%, #2a6080 20%, #c4a882 55%, #8b6340 80%, #3d2010 100%)",
                  borderRadius: 2,
                  top: 40,
                  right: 20,
                  overflow: "hidden",
                }}
              >
                {/* Horizon line */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "38%",
                    height: 1,
                    background: "rgba(196,168,130,0.4)",
                  }}
                />
                {/* Sun */}
                <div
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255,220,100,0.6) 0%, rgba(255,160,50,0.2) 60%, transparent 100%)",
                    right: 40,
                    top: "20%",
                  }}
                />
                {/* Grid overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                      linear-gradient(rgba(184,149,90,0.08) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(184,149,90,0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: "30px 30px",
                  }}
                />
              </div>

              {/* Coordinates badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 30,
                  left: 10,
                  fontFamily: F,
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.gold,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  background: "rgba(26,24,22,0.7)",
                  padding: "6px 12px",
                  borderRadius: 2,
                  border: `1px solid ${C.goldBorder}`,
                }}
              >
                °36.8N 30.7E · Antalya
              </div>

              {/* Corner marks */}
              {[
                { top: 0, left: 0 },
                { top: 0, right: 0 },
                { bottom: 0, left: 0 },
                { bottom: 0, right: 0 },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 16,
                    height: 16,
                    borderTop: i < 2 ? `1px solid ${C.gold}` : "none",
                    borderBottom: i >= 2 ? `1px solid ${C.gold}` : "none",
                    borderLeft: i % 2 === 0 ? `1px solid ${C.gold}` : "none",
                    borderRight: i % 2 === 1 ? `1px solid ${C.gold}` : "none",
                    ...pos,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom gold line */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          }}
        />

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: C.faint,
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: 1,
              height: 24,
              background: `linear-gradient(180deg, ${C.gold}, transparent)`,
            }}
          />
        </div>
      </section>

      {/* ── ZAHLEN ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: C.bgDark,
          padding: isMobile ? "60px 24px" : "80px 60px",
          borderTop: `1px solid rgba(184,149,90,0.15)`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? "40px 20px" : 0,
          }}
        >
          {STATS_DATA.map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: isMobile ? "0" : "0 40px",
                borderRight: !isMobile && i < 3 ? `1px solid rgba(184,149,90,0.15)` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: FH,
                  fontSize: isMobile ? 52 : 68,
                  fontWeight: 400,
                  color: C.gold,
                  lineHeight: 1,
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.stone,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WARUM TÜRKEI ─────────────────────────────────────────────── */}
      <section
        id="warum"
        style={{
          background: C.bgSection,
          padding: isMobile ? "80px 24px" : "120px 60px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Label */}
          <div
            style={{
              fontFamily: F,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: C.gold,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ width: 24, height: 1, background: C.gold }} />
            DER RICHTIGE MARKT
          </div>

          {/* H2 */}
          <h2
            style={{
              fontFamily: FH,
              fontSize: isMobile ? 36 : 52,
              fontWeight: 400,
              color: C.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 640,
              marginBottom: 64,
            }}
          >
            Warum jetzt in türkische Grundstücke investieren?
          </h2>

          {/* Card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {WHY_CARDS.map((card, i) => (
              <div
                key={i}
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  padding: "36px 32px",
                  position: "relative",
                  transition: "box-shadow 0.2s",
                  boxShadow: C.shadow,
                }}
              >
                {/* Roman numeral */}
                <div
                  style={{
                    fontFamily: FH,
                    fontSize: 40,
                    color: C.goldBorder,
                    fontStyle: "italic",
                    marginBottom: 16,
                    lineHeight: 1,
                  }}
                >
                  {card.num}
                </div>
                <h3
                  style={{
                    fontFamily: FH,
                    fontSize: 20,
                    fontWeight: 400,
                    color: C.text,
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGIONEN ─────────────────────────────────────────────────── */}
      <section
        id="regionen"
        style={{
          background: C.white,
          padding: isMobile ? "80px 24px" : "120px 60px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Label */}
          <div
            style={{
              fontFamily: F,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: C.gold,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ width: 24, height: 1, background: C.gold }} />
            AUSGEWÄHLTE LAGEN
          </div>

          <h2
            style={{
              fontFamily: FH,
              fontSize: isMobile ? 36 : 52,
              fontWeight: 400,
              color: C.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 640,
              marginBottom: 60,
            }}
          >
            Die schönsten Regionen an der türkischen Küste
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {REGIONS.map((region, i) => (
              <div
                key={i}
                className="turkey-region-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
              >
                {/* Image area */}
                <div
                  style={{
                    height: 260,
                    background: region.gradient,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Grid overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                      `,
                      backgroundSize: "30px 30px",
                    }}
                  />
                  {/* Region name overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "40px 28px 24px",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: FH,
                        fontSize: 26,
                        fontWeight: 400,
                        color: C.white,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {region.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: "28px 28px 32px",
                    background: C.bg,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
                    {region.desc}
                  </p>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="turkey-region-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: `1px solid ${C.gold}`,
                      color: C.gold,
                      background: "transparent",
                      padding: "10px 20px",
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      transition: "all 0.2s",
                      alignSelf: "flex-start",
                    }}
                  >
                    Grundstücke ansehen →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERIE ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: C.bgDark,
          padding: isMobile ? "80px 24px" : "120px 60px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Label */}
          <div
            style={{
              fontFamily: F,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: C.gold,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ width: 24, height: 1, background: C.gold }} />
            DIREKT VOM ANBIETER
          </div>

          <h2
            style={{
              fontFamily: FH,
              fontSize: isMobile ? 36 : 52,
              fontWeight: 400,
              color: C.white,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 60,
            }}
          >
            Aktuelle Grundstücke
          </h2>

          {galleryLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: C.stone,
                fontSize: 15,
              }}
            >
              Wird geladen…
            </div>
          ) : gallery.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 40px",
                border: `1px dashed ${C.goldBorder}`,
                borderRadius: 4,
                color: C.stone,
              }}
            >
              <div
                style={{
                  fontFamily: FH,
                  fontSize: 24,
                  color: C.faint,
                  marginBottom: 12,
                  fontStyle: "italic",
                }}
              >
                Grundstücke werden in Kürze veröffentlicht
              </div>
              <p style={{ fontSize: 14, color: C.faint }}>
                Kontaktieren Sie uns direkt für aktuelle Verfügbarkeiten.
              </p>
            </div>
          ) : (
            <div
              style={{
                columns: isMobile ? 1 : 3,
                columnGap: 20,
              }}
            >
              {gallery.map((item, i) => (
                <div
                  key={item.id || i}
                  className="turkey-gallery-item"
                  style={{
                    marginBottom: 20,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid rgba(184,149,90,0.12)`,
                  }}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      controls
                      style={{ width: "100%", display: "block" }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || "Grundstück"}
                      style={{ width: "100%", display: "block" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROZESS ──────────────────────────────────────────────────── */}
      <section
        id="prozess"
        style={{
          background: C.bgSection,
          padding: isMobile ? "80px 24px" : "120px 60px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Label */}
          <div
            style={{
              fontFamily: F,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: C.gold,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ width: 24, height: 1, background: C.gold }} />
            SO EINFACH GEHT'S
          </div>

          <h2
            style={{
              fontFamily: FH,
              fontSize: isMobile ? 36 : 52,
              fontWeight: 400,
              color: C.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 640,
              marginBottom: 80,
            }}
          >
            In 4 Schritten zu Ihrem Grundstück in der Türkei
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
              gap: isMobile ? 40 : 24,
              position: "relative",
            }}
          >
            {/* Connector line (desktop only) */}
            {!isMobile && (
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  left: "12.5%",
                  right: "12.5%",
                  height: 1,
                  background: `linear-gradient(90deg, ${C.gold} 0%, ${C.goldBorder} 100%)`,
                  zIndex: 0,
                }}
              />
            )}

            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Number circle */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: C.bgSection,
                    border: `1px solid ${C.gold}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.gold,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {step.n}
                  </span>
                  {/* Large faint number behind */}
                  <span
                    style={{
                      position: "absolute",
                      fontFamily: FH,
                      fontSize: 100,
                      fontWeight: 400,
                      color: "rgba(184,149,90,0.06)",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.n}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: FH,
                    fontSize: 18,
                    fontWeight: 400,
                    color: C.text,
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: C.white,
          padding: isMobile ? "80px 24px" : "120px 60px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: FH,
              fontSize: isMobile ? 36 : 48,
              fontWeight: 400,
              color: C.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 56,
              textAlign: "center",
            }}
          >
            Häufig gestellte Fragen
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="turkey-faq-item"
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "24px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 20,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: F,
                        fontSize: 16,
                        fontWeight: 600,
                        color: isOpen ? C.gold : C.text,
                        lineHeight: 1.4,
                        transition: "color 0.2s",
                      }}
                    >
                      {faq.q}
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `1px solid ${isOpen ? C.gold : C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        background: isOpen ? C.goldBg : "transparent",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          color: isOpen ? C.gold : C.muted,
                          lineHeight: 1,
                          transform: isOpen ? "rotate(45deg)" : "none",
                          display: "block",
                          transition: "transform 0.2s",
                        }}
                      >
                        +
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        paddingBottom: 24,
                        paddingRight: 48,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 15,
                          color: C.muted,
                          lineHeight: 1.75,
                        }}
                      >
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── KONTAKT / CTA ─────────────────────────────────────────────── */}
      <section
        id="kontakt"
        style={{
          background: C.bgDark,
          padding: isMobile ? "80px 24px" : "120px 60px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          {/* Headline */}
          <h2
            style={{
              fontFamily: FH,
              fontSize: isMobile ? 44 : 64,
              fontWeight: 400,
              color: C.white,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            Starten Sie noch heute.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: C.stone,
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto 64px",
            }}
          >
            Unser Team spricht Deutsch und beantwortet alle Ihre Fragen –
            kostenlos und unverbindlich.
          </p>

          {/* Contact cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 56,
            }}
          >
            {/* WhatsApp */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="turkey-contact-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "36px 24px",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 4,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 4,
                  }}
                >
                  WhatsApp
                </div>
                <div style={{ fontSize: 13, color: C.stone }}>Sofortige Antwort</div>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:info@ar-arazi.de"
              className="turkey-contact-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "36px 24px",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 4,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: C.goldBg,
                  border: `1px solid ${C.goldBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 4,
                  }}
                >
                  E-Mail
                </div>
                <div style={{ fontSize: 13, color: C.stone }}>info@ar-arazi.de</div>
              </div>
            </a>

            {/* Telefon */}
            <a
              href="tel:+491739980100"
              className="turkey-contact-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "36px 24px",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 4,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: C.goldBg,
                  border: `1px solid ${C.goldBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.5a19.79 19.79 0 01-3-8.57A2 2 0 012.48 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 4,
                  }}
                >
                  Telefon
                </div>
                <div style={{ fontSize: 13, color: C.stone }}>+49 173 998 01 00</div>
              </div>
            </a>
          </div>

          {/* Big CTA */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="turkey-btn-wa"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: C.gold,
              color: C.white,
              padding: "20px 48px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.03em",
              transition: "all 0.2s",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Jetzt auf WhatsApp beraten lassen →
          </a>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#111110",
          padding: isMobile ? "40px 24px" : "48px 60px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: 24,
            paddingBottom: 32,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 24,
          }}
        >
          {/* Logo */}
          <a
            href="/grundstuecke"
            style={{
              fontFamily: FH,
              fontSize: 20,
              color: C.gold,
              letterSpacing: "0.06em",
            }}
          >
            AR·ARAZI
          </a>

          {/* Nav links */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              ["Warum Türkei", "warum"],
              ["Regionen", "regionen"],
              ["Prozess", "prozess"],
              ["Kontakt", "kontakt"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: F,
                  fontSize: 13,
                  color: C.faint,
                  transition: "color 0.2s",
                  padding: 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Legal */}
          <div style={{ display: "flex", gap: 20 }}>
            {["Impressum", "Datenschutz"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                style={{
                  fontFamily: F,
                  fontSize: 13,
                  color: C.faint,
                  transition: "color 0.2s",
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: C.faint,
            fontFamily: F,
          }}
        >
          © 2025 AR·ARAZI. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
