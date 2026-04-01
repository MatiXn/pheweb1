import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const C = {
  accent: "#3b72b8", accentDk: "#2a5490", accentBg: "#eef4ff", accentBd: "rgba(59,114,184,0.18)",
  text: "#0f1623", muted: "#4b5675", faint: "#8b9ab1",
  border: "rgba(15,22,35,0.08)", borderMd: "rgba(15,22,35,0.13)",
  red: "#dc2626", redBg: "#fef2f2",
  green: "#16a34a", greenBg: "#f0fdf4",
  orange: "#d97706", orangeBg: "#fffbeb",
  purple: "#7c3aed", purpleBg: "#f5f3ff",
  shadow: "0 2px 12px rgba(59,114,184,0.06)",
  shadowMd: "0 8px 32px rgba(59,114,184,0.10)",
  shadowLg: "0 20px 60px rgba(59,114,184,0.12)",
};
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const STATUS_CONFIG = {
  "Aktiv":          { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
  "In Planung":     { bg: "#fef9c3", color: "#a16207", dot: "#eab308" },
  "In Bearbeitung": { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  "Pausiert":       { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  "Abgeschlossen":  { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["In Bearbeitung"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:999, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:700, fontFamily:F }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />{status || "In Bearbeitung"}
    </span>
  );
}

function StatWidget({ label, value, sub, color }) {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:"20px 22px", border:`1.5px solid ${C.border}`, boxShadow:C.shadow }}>
      <div style={{ fontSize:12, fontWeight:600, color:C.faint, marginBottom:8, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
      <div style={{ fontSize:34, fontWeight:800, color:color||C.accent, lineHeight:1, marginBottom:4, fontFamily:F, letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:C.faint, fontFamily:F }}>{sub}</div>}
    </div>
  );
}

const INP = { width:"100%", background:"#f5f7fa", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:14, color:C.text, outline:"none", fontFamily:F, boxSizing:"border-box", marginBottom:10 };

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uebersicht");
  const [editFunnel, setEditFunnel] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { if (location.search.includes("success=1")) setShowSuccess(true); }, [location]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);
      const { data } = await supabase.from("funnels").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setFunnels(data || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };

  const handleDelete = async (id) => {
    if (!window.confirm("Funnel wirklich löschen?")) return;
    await supabase.from("funnels").delete().eq("id", id);
    setFunnels(f => f.filter(x => x.id !== id));
  };

  const handleStatus = async (id, status) => {
    await supabase.from("funnels").update({ status }).eq("id", id);
    setFunnels(f => f.map(x => x.id === id ? { ...x, status } : x));
  };

  const handleSave = async () => {
    const { id, position, region, gehalt, whatsapp, info1, info2, info3, info4, info5, bewerbungen, qualifiziert, conversion, kosten } = editFunnel;
    await supabase.from("funnels").update({ position, region, gehalt, whatsapp, info1, info2, info3, info4, info5, bewerbungen, qualifiziert, conversion, kosten }).eq("id", id);
    setFunnels(f => f.map(x => x.id === id ? { ...x, ...editFunnel } : x));
    setEditFunnel(null);
  };

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, color:C.muted }}>Wird geladen...</div>;

  const unternehmen = user?.user_metadata?.unternehmen || user?.email;
  const aktive = funnels.filter(f => f.status === "Aktiv").length;
  const planung = funnels.filter(f => ["In Planung","In Bearbeitung"].includes(f.status)).length;
  const totalBew = funnels.reduce((s,f) => s + (parseInt(f.bewerbungen)||0), 0);
  const totalQual = funnels.reduce((s,f) => s + (parseInt(f.qualifiziert)||0), 0);
  const maxBew = Math.max(...funnels.map(f => parseInt(f.bewerbungen)||0), 1);

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa", fontFamily:F }}>

      {/* Edit Modal */}
      {editFunnel && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", boxShadow:C.shadowLg }}>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:20, color:C.text }}>Funnel bearbeiten</h3>
            {[["Position","position"],["Region","region"],["Gehalt","gehalt"],["WhatsApp","whatsapp"],["Vorteil 1","info1"],["Vorteil 2","info2"],["Vorteil 3","info3"],["Vorteil 4","info4"],["Vorteil 5","info5"]].map(([l,k]) => (
              <div key={k}>
                <label style={{ fontSize:12, fontWeight:600, color:C.faint, display:"block", marginBottom:4 }}>{l}</label>
                <input style={INP} value={editFunnel[k]||""} onChange={e => setEditFunnel({...editFunnel,[k]:e.target.value})} />
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, marginTop:4, marginBottom:4 }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.muted, marginBottom:12 }}>Statistiken pflegen</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[["Bewerbungen gesamt","bewerbungen"],["Qualifizierte Kandidaten","qualifiziert"],["Conversion-Rate (%)","conversion"],["Kosten pro Bewerbung (€)","kosten"]].map(([l,k]) => (
                  <div key={k}>
                    <label style={{ fontSize:12, fontWeight:600, color:C.faint, display:"block", marginBottom:4 }}>{l}</label>
                    <input style={{...INP,marginBottom:0}} type="number" value={editFunnel[k]||""} onChange={e => setEditFunnel({...editFunnel,[k]:e.target.value})} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={() => setEditFunnel(null)} style={{ flex:1, background:"none", border:`1.5px solid ${C.borderMd}`, borderRadius:10, padding:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:F, color:C.muted }}>Abbrechen</button>
              <button onClick={handleSave} style={{ flex:2, background:C.accent, color:"#fff", border:"none", borderRadius:10, padding:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:F }}>Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", position:"sticky", top:0, zIndex:100, boxShadow:C.shadow }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <Link to="/" style={{ fontFamily:F, fontSize:20, fontWeight:800, color:C.text, textDecoration:"none", letterSpacing:"-0.02em" }}>phe<em style={{ fontStyle:"italic", color:C.accent }}>web</em></Link>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:14, color:C.muted, fontWeight:500 }}>{unternehmen}</span>
            <button onClick={handleLogout} style={{ background:"none", border:`1.5px solid ${C.borderMd}`, borderRadius:10, padding:"7px 14px", cursor:"pointer", fontFamily:F, fontSize:13, fontWeight:600, color:C.muted }}>Abmelden</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>

        {showSuccess && (
          <div style={{ background:"#dcfce7", border:"1.5px solid #86efac", borderRadius:14, padding:"14px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontFamily:F, fontSize:14, fontWeight:600, color:"#16a34a" }}>✓ Funnel erstellt! Wir melden uns innerhalb von 24 Stunden.</span>
            <button onClick={() => setShowSuccess(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#16a34a", fontSize:18 }}>✕</button>
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:800, color:C.text, letterSpacing:"-0.02em", marginBottom:4 }}>Dashboard</h1>
            <p style={{ fontSize:14, color:C.faint }}>Willkommen zurück, {unternehmen}</p>
          </div>
          <Link to="/onboarding" style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.accent, color:"#fff", borderRadius:12, padding:"11px 22px", fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 4px 16px rgba(59,114,184,0.22)" }}>+ Neuen Funnel erstellen</Link>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:28, background:"#fff", borderRadius:14, padding:6, border:`1px solid ${C.border}`, width:"fit-content" }}>
          {[["uebersicht","Übersicht"],["funnels","Meine Funnels"],["statistiken","Statistiken"]].map(([id,label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ background:activeTab===id?C.accent:"none", color:activeTab===id?"#fff":C.muted, border:"none", borderRadius:10, padding:"8px 18px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:F, transition:"all 0.2s" }}>{label}</button>
          ))}
        </div>

        {/* ÜBERSICHT */}
        {activeTab === "uebersicht" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
              <StatWidget label="Aktive Funnels" value={aktive} sub="laufende Kampagnen" color={C.green} />
              <StatWidget label="In Planung" value={planung} sub="werden vorbereitet" color={C.orange} />
              <StatWidget label="Bewerbungen gesamt" value={totalBew} sub="über alle Funnels" color={C.accent} />
              <StatWidget label="Qualifizierte Kandidaten" value={totalQual} sub="nach Vorfilterung" color={C.purple} />
            </div>
            <div style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${C.border}`, boxShadow:C.shadow, overflow:"hidden" }}>
              <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:C.text }}>Meine Funnels</h3>
                <button onClick={() => setActiveTab("funnels")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:C.accent, fontFamily:F }}>Alle anzeigen →</button>
              </div>
              {funnels.length === 0 ? (
                <div style={{ padding:"48px 24px", textAlign:"center" }}>
                  <p style={{ fontSize:14, color:C.faint, marginBottom:16 }}>Noch kein Funnel erstellt.</p>
                  <Link to="/onboarding" style={{ display:"inline-block", background:C.accent, color:"#fff", borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:700, textDecoration:"none" }}>Ersten Funnel erstellen</Link>
                </div>
              ) : funnels.slice(0,3).map((f,i) => (
                <div key={f.id} style={{ padding:"16px 24px", borderBottom:i<Math.min(funnels.length,3)-1?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4 }}>{f.position}</div>
                    <div style={{ fontSize:13, color:C.faint }}>{f.region} · {new Date(f.created_at).toLocaleDateString("de-DE")}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>{f.bewerbungen||0}</div>
                      <div style={{ fontSize:10, color:C.faint, textTransform:"uppercase", letterSpacing:"0.06em" }}>Bewerb.</div>
                    </div>
                    <StatusBadge status={f.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FUNNELS */}
        {activeTab === "funnels" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {funnels.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:18, padding:"48px 24px", textAlign:"center", border:`1.5px solid ${C.border}` }}>
                <p style={{ fontSize:14, color:C.faint, marginBottom:16 }}>Noch kein Funnel erstellt.</p>
                <Link to="/onboarding" style={{ display:"inline-block", background:C.accent, color:"#fff", borderRadius:10, padding:"10px 20px", fontSize:14, fontWeight:700, textDecoration:"none" }}>Ersten Funnel erstellen</Link>
              </div>
            ) : funnels.map(f => (
              <div key={f.id} style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${C.border}`, boxShadow:C.shadow, overflow:"hidden" }}>
                <div style={{ padding:"20px 24px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                      <h3 style={{ fontSize:17, fontWeight:800, color:C.text }}>{f.position}</h3>
                      <StatusBadge status={f.status} />
                    </div>
                    <div style={{ fontSize:13, color:C.faint, marginBottom:14 }}>{f.region} · {f.gehalt} · {new Date(f.created_at).toLocaleDateString("de-DE")}</div>
                    <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                      {[["Bewerbungen",f.bewerbungen||0,C.accent],["Qualifiziert",f.qualifiziert||0,C.purple],["Conversion",f.conversion?`${f.conversion}%`:"–",C.green],["Kosten/Bew.",f.kosten?`${f.kosten}€`:"–",C.orange]].map(([label,value,color]) => (
                        <div key={label} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:22, fontWeight:800, color, lineHeight:1 }}>{value}</div>
                          <div style={{ fontSize:10, color:C.faint, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                    <select value={f.status||"In Bearbeitung"} onChange={e => handleStatus(f.id, e.target.value)} style={{ background:"#f5f7fa", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 10px", fontSize:13, fontFamily:F, cursor:"pointer", color:C.text }}>
                      {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => setEditFunnel({...f})} style={{ background:C.accentBg, color:C.accent, border:`1px solid ${C.accentBd}`, borderRadius:8, padding:"6px 14px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F }}>Bearbeiten</button>
                      <button onClick={() => handleDelete(f.id)} style={{ background:C.redBg, color:C.red, border:"1px solid #fecaca", borderRadius:8, padding:"6px 14px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:F }}>Löschen</button>
                    </div>
                  </div>
                </div>
                {[f.info1,f.info2,f.info3,f.info4,f.info5].some(Boolean) && (
                  <div style={{ padding:"10px 24px", background:"#f8fafc", borderTop:`1px solid ${C.border}`, display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[f.info1,f.info2,f.info3,f.info4,f.info5].filter(Boolean).map((info,i) => (
                      <span key={i} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 10px", fontSize:12, color:C.muted }}>✓ {info}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STATISTIKEN */}
        {activeTab === "statistiken" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:20 }}>

            <div style={{ background:"#fff", borderRadius:18, padding:24, border:`1.5px solid ${C.border}`, boxShadow:C.shadow }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:4 }}>Bewerbungen pro Funnel</h3>
              <p style={{ fontSize:12, color:C.faint, marginBottom:20 }}>Vergleich aller aktiven Funnels</p>
              {funnels.length === 0 ? <div style={{ textAlign:"center", padding:"24px 0", color:C.faint, fontSize:13 }}>Noch keine Daten</div> : (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {funnels.map(f => (
                    <div key={f.id}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{f.position}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:C.accent }}>{f.bewerbungen||0}</span>
                      </div>
                      <div style={{ background:C.accentBg, borderRadius:999, height:8 }}>
                        <div style={{ background:C.accent, height:"100%", width:`${((parseInt(f.bewerbungen)||0)/maxBew)*100}%`, borderRadius:999, transition:"width 0.5s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background:"#fff", borderRadius:18, padding:24, border:`1.5px solid ${C.border}`, boxShadow:C.shadow }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>Qualifizierungsrate</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <div style={{ background:C.accentBg, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:34, fontWeight:800, color:C.accent, lineHeight:1 }}>{totalBew}</div>
                  <div style={{ fontSize:11, color:C.faint, marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Bewerbungen</div>
                </div>
                <div style={{ background:C.purpleBg, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:34, fontWeight:800, color:C.purple, lineHeight:1 }}>{totalQual}</div>
                  <div style={{ fontSize:11, color:C.faint, marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Qualifiziert</div>
                </div>
              </div>
              {totalBew > 0 && (
                <div style={{ background:C.greenBg, borderRadius:10, padding:14, textAlign:"center" }}>
                  <div style={{ fontSize:28, fontWeight:800, color:C.green }}>{Math.round((totalQual/totalBew)*100)}%</div>
                  <div style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>Qualifizierungsrate</div>
                </div>
              )}
            </div>

            <div style={{ background:"#fff", borderRadius:18, padding:24, border:`1.5px solid ${C.border}`, boxShadow:C.shadow }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>Conversion & Kosten</h3>
              {funnels.length === 0 ? <div style={{ textAlign:"center", padding:"24px 0", color:C.faint, fontSize:13 }}>Noch keine Daten</div> : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {funnels.map(f => (
                    <div key={f.id} style={{ padding:14, background:"#f8fafc", borderRadius:12, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>{f.position}</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <div style={{ background:C.greenBg, borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                          <div style={{ fontSize:20, fontWeight:800, color:C.green }}>{f.conversion?`${f.conversion}%`:"–"}</div>
                          <div style={{ fontSize:10, color:C.faint, textTransform:"uppercase", letterSpacing:"0.06em" }}>Conversion</div>
                        </div>
                        <div style={{ background:C.orangeBg, borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                          <div style={{ fontSize:20, fontWeight:800, color:C.orange }}>{f.kosten?`${f.kosten}€`:"–"}</div>
                          <div style={{ fontSize:10, color:C.faint, textTransform:"uppercase", letterSpacing:"0.06em" }}>Kosten/Bew.</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background:"#fff", borderRadius:18, padding:24, border:`1.5px solid ${C.border}`, boxShadow:C.shadow }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>Status-Übersicht</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = funnels.filter(f => (f.status||"In Bearbeitung") === status).length;
                  return (
                    <div key={status} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:`${cfg.bg}`, borderRadius:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />
                        <span style={{ fontSize:13, fontWeight:600, color:cfg.color }}>{status}</span>
                      </div>
                      <span style={{ fontSize:18, fontWeight:800, color:cfg.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
