import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const C = {
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
  shadowMd: "0 8px 32px rgba(59,114,184,0.10)",
};

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      // Funnels des Kunden laden
      const { data } = await supabase
        .from("funnels")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setFunnels(data || []);
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, color: C.muted }}>
        Wird geladen...
      </div>
    );
  }

  const unternehmen = user?.user_metadata?.unternehmen || user?.email;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", fontFamily: F }}>
      {/* Header */}
      <nav style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ fontFamily: F, fontSize: 22, fontWeight: 800, color: C.text, textDecoration: "none", letterSpacing: "-0.02em" }}>
          phe<em style={{ fontStyle: "italic", color: C.accent }}>web</em>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{unternehmen}</span>
          <button onClick={handleLogout} style={{ background: "none", border: `1.5px solid ${C.borderMd}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 600, color: C.muted }}>Abmelden</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px" }}>
        {/* Begrüßung */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Willkommen, {unternehmen}
          </h1>
          <p style={{ fontSize: 15, color: C.muted }}>Hier sehen Sie alle Ihre Recruiting-Funnels.</p>
        </div>

        {/* Neuen Funnel erstellen */}
        <Link to="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", borderRadius: 12, padding: "13px 24px", fontSize: 15, fontWeight: 700, textDecoration: "none", marginBottom: 32, boxShadow: "0 4px 20px rgba(59,114,184,0.22)" }}>
          + Neuen Funnel erstellen
        </Link>

        {/* Funnels Liste */}
        {funnels.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, padding: "48px 32px", textAlign: "center", border: `1.5px solid ${C.border}`, boxShadow: C.shadow }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10 }}>Noch kein Funnel erstellt</h3>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>Erstellen Sie Ihren ersten Recruiting-Funnel – in weniger als 3 Minuten.</p>
            <Link to="/onboarding" style={{ display: "inline-block", background: C.accent, color: "#fff", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Jetzt starten</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {funnels.map((funnel) => (
              <div key={funnel.id} style={{ background: "#fff", borderRadius: 18, padding: 24, border: `1.5px solid ${C.border}`, boxShadow: C.shadow }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.faint, marginBottom: 8 }}>
                  {new Date(funnel.created_at).toLocaleDateString("de-DE")}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{funnel.position}</h3>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>{funnel.region}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 999, background: C.accentBg, border: `1px solid ${C.accentBd}`, fontSize: 12, fontWeight: 600, color: C.accent }}>
                    {funnel.status || "In Bearbeitung"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
