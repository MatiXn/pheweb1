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
  red: "#dc2626",
  green: "#16a34a",
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

export default function RegisterPage() {
  const [form, setForm] = useState({ unternehmen: "", email: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { unternehmen: form.unternehmen },
      },
    });

    if (error) {
      setError("Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: F }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 20, padding: 36, boxShadow: C.shadowLg, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dcfce7", border: "2px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26 }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>Registrierung erfolgreich</h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>Wir haben Ihnen eine Bestätigungs-Email geschickt. Bitte bestätigen Sie Ihre Email-Adresse und melden Sie sich dann an.</p>
          <Link to="/login" style={{ display: "inline-block", background: C.accent, color: "#fff", borderRadius: 12, padding: "13px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Zur Anmeldung</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: F }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ fontFamily: F, fontSize: 28, fontWeight: 800, color: C.text, textDecoration: "none", letterSpacing: "-0.02em" }}>
            phe<em style={{ fontStyle: "italic", color: C.accent }}>web</em>
          </Link>
          <p style={{ marginTop: 8, fontSize: 15, color: C.muted }}>Erstellen Sie Ihren kostenlosen Account</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 24, letterSpacing: "-0.01em" }}>Registrieren</h1>

          <form onSubmit={handleRegister}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>Unternehmensname</label>
            <input style={INP} type="text" placeholder="Ihr Unternehmen GmbH" required value={form.unternehmen} onChange={setF("unternehmen")} />

            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>E-Mail-Adresse</label>
            <input style={INP} type="email" placeholder="ihre@email.de" required value={form.email} onChange={setF("email")} />

            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>Passwort</label>
            <input style={INP} type="password" placeholder="Mindestens 8 Zeichen" required value={form.password} onChange={setF("password")} />

            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>Passwort bestätigen</label>
            <input style={{ ...INP, marginBottom: 20 }} type="password" placeholder="Passwort wiederholen" required value={form.password2} onChange={setF("password2")} />

            {error && <p style={{ fontSize: 13, color: C.red, marginBottom: 16, textAlign: "center" }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: F, opacity: loading ? 0.75 : 1 }}>
              {loading ? "Wird registriert..." : "Konto erstellen"}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: C.faint }}>
            Bereits ein Konto?{" "}
            <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>Anmelden</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.faint }}>
          <Link to="/" style={{ color: C.faint, textDecoration: "none" }}>← Zurück zu pheweb.de</Link>
        </p>
      </div>
    </div>
  );
}
