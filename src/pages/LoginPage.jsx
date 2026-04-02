import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const C = {
  accent: "#3b72b8",
  accentBg: "#eef4ff",
  accentBd: "rgba(59,114,184,0.18)",
  text: "#0f1623",
  muted: "#4b5675",
  faint: "#8b9ab1",
  border: "rgba(15,22,35,0.08)",
  borderMd: "rgba(15,22,35,0.13)",
  red: "#dc2626",
  shadow: "0 2px 12px rgba(59,114,184,0.06)",
  shadowLg: "0 20px 60px rgba(59,114,184,0.12)",
};

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const INP = {
  width: "100%",
  background: "#f5f7fa",
  border: `1.5px solid ${C.border}`,
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 15,
  color: C.text,
  outline: "none",
  fontFamily: F,
  marginBottom: 12,
  boxSizing: "border-box",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email oder Passwort falsch. Bitte erneut versuchen.");
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: F }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ fontFamily: F, fontSize: 28, fontWeight: 800, color: C.text, textDecoration: "none", letterSpacing: "-0.02em" }}>
            phe<em style={{ fontStyle: "italic", color: C.accent }}>web</em>
          </Link>
          <p style={{ marginTop: 8, fontSize: 15, color: C.muted }}>Melden Sie sich in Ihrem Konto an</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 24, letterSpacing: "-0.01em" }}>Anmelden</h1>

          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>E-Mail-Adresse</label>
            <input style={INP} type="email" placeholder="ihre@email.de" required value={email} onChange={(e) => setEmail(e.target.value)} />

            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>Passwort</label>
            <input style={{ ...INP, marginBottom: 20 }} type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <p style={{ fontSize: 13, color: C.red, marginBottom: 16, textAlign: "center" }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: F, opacity: loading ? 0.75 : 1, transition: "all 0.2s" }}>
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: C.faint }}>
            Noch kein Konto?{" "}
            <Link to="/register" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>Jetzt registrieren</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.faint }}>
          <Link to="/" style={{ color: C.faint, textDecoration: "none" }}>← Zurück zu pheweb.de</Link>
        </p>
      </div>
    </div>
  );
}
