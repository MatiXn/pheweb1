import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const C = {
  accent:"#3b72b8",accentDk:"#2a5490",accentBg:"#eef4ff",accentBd:"rgba(59,114,184,0.18)",
  text:"#0f1623",muted:"#4b5675",faint:"#8b9ab1",
  border:"rgba(15,22,35,0.08)",borderMd:"rgba(15,22,35,0.13)",
  red:"#dc2626",redBg:"#fef2f2",green:"#16a34a",greenBg:"#f0fdf4",
  orange:"#d97706",orangeBg:"#fffbeb",purple:"#7c3aed",purpleBg:"#f5f3ff",
  shadow:"0 2px 12px rgba(59,114,184,0.06)",
  shadowMd:"0 8px 32px rgba(59,114,184,0.10)",
  shadowLg:"0 20px 60px rgba(59,114,184,0.12)",
};
const F = "\'Helvetica Neue\', Helvetica, Arial, sans-serif";
const PHASEN = ["Awareness","Interest","Consideration","Application","Selection","Hiring"];
const STATUS_CONFIG = {
  "Aktiv":          {bg:"#dcfce7",color:"#16a34a",dot:"#22c55e"},
  "In Planung":     {bg:"#fef9c3",color:"#a16207",dot:"#eab308"},
  "In Bearbeitung": {bg:"#dbeafe",color:"#1d4ed8",dot:"#3b82f6"},
  "Pausiert":       {bg:"#f3f4f6",color:"#6b7280",dot:"#9ca3af"},
  "Abgeschlossen":  {bg:"#f0fdf4",color:"#15803d",dot:"#22c55e"},
};

function StatusBadge({status}){
  const cfg=STATUS_CONFIG[status]||STATUS_CONFIG["In Bearbeitung"];
  return(<span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:999,background:cfg.bg,color:cfg.color,fontSize:12,fontWeight:700,fontFamily:F}}><span style={{width:6,height:6,borderRadius:"50%",background:cfg.dot}}/>{status||"In Bearbeitung"}</span>);
}

function PhaseProgress({status}){
  const phaseMap={"In Bearbeitung":1,"In Planung":2,"Aktiv":4,"Pausiert":3,"Abgeschlossen":6};
  const current=phaseMap[status]||1;
  return(
    <div style={{marginTop:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontFamily:F,fontSize:11,color:"#8b9ab1",fontWeight:600}}>Funnel-Phase</span>
        <span style={{fontFamily:F,fontSize:11,color:"#3b72b8",fontWeight:700}}>{PHASEN[current-1]}</span>
      </div>
      <div style={{display:"flex",gap:3}}>
        {PHASEN.map((p,i)=>(<div key={p} title={p} style={{flex:1,height:5,borderRadius:999,background:i<current?"#3b72b8":"#eef4ff",transition:"background 0.3s"}}/>))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontFamily:F,fontSize:10,color:"#8b9ab1"}}>Start</span>
        <span style={{fontFamily:F,fontSize:10,color:"#8b9ab1"}}>Einstellung</span>
      </div>
    </div>
  );
}

function StatWidget({label,value,sub,color}){
  return(
    <div style={{background:"#fff",borderRadius:16,padding:"20px 22px",border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)"}}>
      <div style={{fontSize:11,fontWeight:700,color:"#8b9ab1",marginBottom:8,fontFamily:F,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
      <div style={{fontSize:34,fontWeight:800,color:color||"#3b72b8",lineHeight:1,marginBottom:4,fontFamily:F,letterSpacing:"-0.02em"}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:"#8b9ab1",fontFamily:F}}>{sub}</div>}
    </div>
  );
}

function EmptyState(){
  return(
    <div style={{background:"#fff",borderRadius:20,padding:"56px 32px",textAlign:"center",border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)"}}>
      <div style={{width:64,height:64,borderRadius:20,background:"#eef4ff",border:"2px solid rgba(59,114,184,0.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28}}>🚀</div>
      <h3 style={{fontFamily:F,fontSize:20,fontWeight:800,color:"#0f1623",marginBottom:10}}>Noch kein Funnel erstellt</h3>
      <p style={{fontFamily:F,fontSize:14,color:"#4b5675",lineHeight:1.7,marginBottom:24,maxWidth:380,margin:"0 auto 24px"}}>Erstellen Sie Ihren ersten Recruiting-Funnel. In 2 einfachen Schritten – wir übernehmen den Rest.</p>
      <Link to="/onboarding" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#3b72b8",color:"#fff",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 16px rgba(59,114,184,0.22)"}}>+ Ersten Funnel erstellen</Link>
    </div>
  );
}

const INP={width:"100%",background:"#f5f7fa",border:"1.5px solid rgba(15,22,35,0.08)",borderRadius:10,padding:"10px 14px",fontSize:14,color:"#0f1623",outline:"none",fontFamily:F,boxSizing:"border-box",marginBottom:10};

export default function DashboardPage(){
  const[user,setUser]=useState(null);
  const[funnels,setFunnels]=useState([]);
  const[loading,setLoading]=useState(true);
  const[activeTab,setActiveTab]=useState("uebersicht");
  const[editFunnel,setEditFunnel]=useState(null);
  const[showSuccess,setShowSuccess]=useState(false);
  const navigate=useNavigate();
  const location=useLocation();

  useEffect(()=>{if(location.search.includes("success=1"))setShowSuccess(true);},[location]);
  useEffect(()=>{
    const init=async()=>{
      const{data:{user}}=await supabase.auth.getUser();
      if(!user){navigate("/login");return;}
      setUser(user);
      const{data}=await supabase.from("funnels").select("*").eq("user_id",user.id).order("created_at",{ascending:false});
      setFunnels(data||[]);
      setLoading(false);
    };
    init();
  },[navigate]);

  const handleLogout=async()=>{await supabase.auth.signOut();navigate("/login");};
  const handleDelete=async(id)=>{
    if(!window.confirm("Funnel wirklich löschen?"))return;
    await supabase.from("funnels").delete().eq("id",id);
    setFunnels(f=>f.filter(x=>x.id!==id));
  };
  const handleStatus=async(id,status)=>{
    await supabase.from("funnels").update({status}).eq("id",id);
    setFunnels(f=>f.map(x=>x.id===id?{...x,status}:x));
  };
  const handleSave=async()=>{
    const{id,position,region,gehalt,whatsapp,info1,info2,info3,info4,info5,bewerbungen,qualifiziert,conversion,kosten}=editFunnel;
    await supabase.from("funnels").update({position,region,gehalt,whatsapp,info1,info2,info3,info4,info5,bewerbungen,qualifiziert,conversion,kosten}).eq("id",id);
    setFunnels(f=>f.map(x=>x.id===id?{...x,...editFunnel}:x));
    setEditFunnel(null);
  };

  if(loading)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,background:"#f5f7fa"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:40,height:40,border:"3px solid #eef4ff",borderTop:"3px solid #3b72b8",borderRadius:"50%",margin:"0 auto 16px",animation:"spin 0.8s linear infinite"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{fontFamily:F,fontSize:14,color:"#8b9ab1"}}>Wird geladen...</p>
      </div>
    </div>
  );

  const unternehmen=user?.user_metadata?.unternehmen||user?.email;
  const aktive=funnels.filter(f=>f.status==="Aktiv").length;
  const planung=funnels.filter(f=>["In Planung","In Bearbeitung"].includes(f.status)).length;
  const totalBew=funnels.reduce((s,f)=>s+(parseInt(f.bewerbungen)||0),0);
  const totalQual=funnels.reduce((s,f)=>s+(parseInt(f.qualifiziert)||0),0);
  const maxBew=Math.max(...funnels.map(f=>parseInt(f.bewerbungen)||0),1);
  const neusterFunnel=funnels[0];

  return(
    <div style={{minHeight:"100vh",background:"#f5f7fa",fontFamily:F}}>
      {editFunnel&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:"#fff",borderRadius:20,padding:32,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(59,114,184,0.12)"}}>
            <h3 style={{fontSize:20,fontWeight:800,marginBottom:20,color:"#0f1623",fontFamily:F}}>Funnel bearbeiten</h3>
            {[["Position","position"],["Region","region"],["Gehalt","gehalt"],["WhatsApp","whatsapp"],["Vorteil 1","info1"],["Vorteil 2","info2"],["Vorteil 3","info3"],["Vorteil 4","info4"],["Vorteil 5","info5"]].map(([l,k])=>(
              <div key={k}><label style={{fontSize:12,fontWeight:600,color:"#8b9ab1",display:"block",marginBottom:4,fontFamily:F}}>{l}</label><input style={INP} value={editFunnel[k]||""} onChange={e=>setEditFunnel({...editFunnel,[k]:e.target.value})}/></div>
            ))}
            <div style={{borderTop:"1px solid rgba(15,22,35,0.08)",paddingTop:16,marginTop:4}}>
              <p style={{fontSize:13,fontWeight:700,color:"#4b5675",marginBottom:12,fontFamily:F}}>Statistiken</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["Bewerbungen","bewerbungen"],["Qualifiziert","qualifiziert"],["Conversion (%)","conversion"],["Kosten/Bew. (€)","kosten"]].map(([l,k])=>(
                  <div key={k}><label style={{fontSize:12,fontWeight:600,color:"#8b9ab1",display:"block",marginBottom:4,fontFamily:F}}>{l}</label><input style={{...INP,marginBottom:0}} type="number" value={editFunnel[k]||""} onChange={e=>setEditFunnel({...editFunnel,[k]:e.target.value})}/></div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setEditFunnel(null)} style={{flex:1,background:"none",border:"1.5px solid rgba(15,22,35,0.13)",borderRadius:10,padding:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F,color:"#4b5675"}}>Abbrechen</button>
              <button onClick={handleSave} style={{flex:2,background:"#3b72b8",color:"#fff",border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>Speichern</button>
            </div>
          </div>
        </div>
      )}

      <nav style={{background:"#0f1623",padding:"0 24px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(0,0,0,0.2)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <Link to="/" style={{fontFamily:F,fontSize:20,fontWeight:800,color:"#fff",textDecoration:"none",letterSpacing:"-0.02em"}}>phe<em style={{fontStyle:"italic",color:"#3b72b8"}}>web</em></Link>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontSize:14,color:"rgba(255,255,255,0.6)",fontWeight:500,fontFamily:F}}>{unternehmen}</span>
            <button onClick={handleLogout} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"7px 14px",cursor:"pointer",fontFamily:F,fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>Abmelden</button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>
        {showSuccess&&(
          <div style={{background:"#dcfce7",border:"1.5px solid #86efac",borderRadius:14,padding:"14px 20px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:F,fontSize:14,fontWeight:600,color:"#16a34a"}}>✓ Funnel erstellt! Wir melden uns innerhalb von 24 Stunden.</span>
            <button onClick={()=>setShowSuccess(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#16a34a",fontSize:18}}>✕</button>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:"clamp(22px,3vw,30px)",fontWeight:800,color:"#0f1623",letterSpacing:"-0.02em",marginBottom:4,fontFamily:F}}>Dashboard</h1>
            <p style={{fontSize:14,color:"#8b9ab1",fontFamily:F}}>Willkommen zurück, {unternehmen}</p>
          </div>
          <Link to="/onboarding" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#3b72b8",color:"#fff",borderRadius:12,padding:"11px 22px",fontSize:14,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 16px rgba(59,114,184,0.22)",fontFamily:F}}>+ Neuen Funnel erstellen</Link>
        </div>

        <div style={{display:"flex",gap:4,marginBottom:28,background:"#fff",borderRadius:14,padding:6,border:"1px solid rgba(15,22,35,0.08)",width:"fit-content"}}>
          {[["uebersicht","Übersicht"],["funnels","Meine Funnels"],["statistiken","Statistiken"]].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{background:activeTab===id?"#3b72b8":"none",color:activeTab===id?"#fff":"#4b5675",border:"none",borderRadius:10,padding:"8px 18px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F,transition:"all 0.2s"}}>{label}</button>
          ))}
        </div>

        {activeTab==="uebersicht"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
              <StatWidget label="Aktive Funnels" value={aktive} sub="laufende Kampagnen" color="#16a34a"/>
              <StatWidget label="In Bearbeitung" value={planung} sub="werden vorbereitet" color="#d97706"/>
              <StatWidget label="Bewerbungen gesamt" value={totalBew} sub="über alle Funnels" color="#3b72b8"/>
              <StatWidget label="Qualifizierte Kandidaten" value={totalQual} sub="nach Vorfilterung" color="#7c3aed"/>
            </div>
            {funnels.length===0?<EmptyState/>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16}}>
                <div style={{background:"#fff",borderRadius:18,border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)",overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(135deg,#0f1623 0%,#1a2744 100%)",padding:"20px 24px"}}>
                    <p style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(255,255,255,0.5)",marginBottom:6}}>Status</p>
                    <h3 style={{fontFamily:F,fontSize:17,fontWeight:800,color:"#fff",marginBottom:4}}>
                      {neusterFunnel?.status==="Aktiv"?"Ihr Funnel ist live! 🎉":neusterFunnel?.status==="In Bearbeitung"?"Wir arbeiten daran...":neusterFunnel?.status==="Abgeschlossen"?"Funnel abgeschlossen ✓":"Funnel wird vorbereitet"}
                    </h3>
                    <p style={{fontFamily:F,fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>
                      {neusterFunnel?.status==="Aktiv"?"Ihre Kampagne läuft. Neue Bewerbungen erscheinen automatisch hier.":neusterFunnel?.status==="In Bearbeitung"?"Wir richten Ihren Funnel ein und melden uns innerhalb von 24 Stunden.":"Ihr Funnel wird gerade für den Start vorbereitet."}
                    </p>
                  </div>
                  <div style={{padding:"20px 24px"}}>
                    <p style={{fontFamily:F,fontSize:12,fontWeight:700,color:"#8b9ab1",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Nächste Schritte</p>
                    {[
                      {done:true,text:"Funnel-Anfrage eingereicht"},
                      {done:neusterFunnel?.status!=="In Bearbeitung",text:"Einrichtung durch pheweb"},
                      {done:neusterFunnel?.status==="Aktiv"||neusterFunnel?.status==="Abgeschlossen",text:"Kampagne wird geschaltet"},
                      {done:(parseInt(neusterFunnel?.bewerbungen)||0)>0,text:"Erste Bewerbungen eingehen"},
                    ].map(({done,text},i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<3?12:0}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:done?"#16a34a":"#eef4ff",border:`2px solid ${done?"#86efac":"rgba(59,114,184,0.18)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:800,color:done?"#fff":"#8b9ab1"}}>{done?"✓":i+1}</div>
                        <span style={{fontFamily:F,fontSize:13,color:done?"#0f1623":"#8b9ab1",fontWeight:done?600:400}}>{text}</span>
                      </div>
                    ))}
                    <a href="https://wa.me/491739980100" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:20,background:"#22c55e",color:"#fff",borderRadius:10,padding:"10px 18px",fontFamily:F,fontSize:13,fontWeight:700,textDecoration:"none"}}>Direkt kontaktieren</a>
                  </div>
                </div>
                <div style={{background:"#fff",borderRadius:18,border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)",padding:"20px 24px"}}>
                  <p style={{fontFamily:F,fontSize:11,fontWeight:700,color:"#8b9ab1",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Aktueller Funnel</p>
                  {neusterFunnel&&(
                    <>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                        <div>
                          <h3 style={{fontFamily:F,fontSize:16,fontWeight:800,color:"#0f1623",marginBottom:4}}>{neusterFunnel.position}</h3>
                          <p style={{fontFamily:F,fontSize:13,color:"#8b9ab1"}}>{neusterFunnel.region} · {neusterFunnel.gehalt}</p>
                        </div>
                        <StatusBadge status={neusterFunnel.status}/>
                      </div>
                      <PhaseProgress status={neusterFunnel.status}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:20}}>
                        {[["Bewerb.",neusterFunnel.bewerbungen||0,"#3b72b8"],["Qualif.",neusterFunnel.qualifiziert||0,"#7c3aed"],["Conv.",neusterFunnel.conversion?`${neusterFunnel.conversion}%`:"–","#16a34a"]].map(([l,v,c])=>(
                          <div key={l} style={{background:"#f5f7fa",borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                            <div style={{fontFamily:F,fontSize:20,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                            <div style={{fontFamily:F,fontSize:10,color:"#8b9ab1",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:4}}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>setActiveTab("funnels")} style={{width:"100%",marginTop:16,background:"none",border:"1.5px solid rgba(15,22,35,0.08)",borderRadius:10,padding:"10px",fontFamily:F,fontSize:13,fontWeight:600,color:"#3b72b8",cursor:"pointer"}}>Alle Funnels anzeigen →</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="funnels"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {funnels.length===0?<EmptyState/>:funnels.map(f=>(
              <div key={f.id} style={{background:"#fff",borderRadius:18,border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)",overflow:"hidden"}}>
                <div style={{padding:"20px 24px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                      <h3 style={{fontSize:17,fontWeight:800,color:"#0f1623",fontFamily:F}}>{f.position}</h3>
                      <StatusBadge status={f.status}/>
                    </div>
                    <div style={{fontSize:13,color:"#8b9ab1",fontFamily:F,marginBottom:14}}>{f.region} · {f.gehalt} · {new Date(f.created_at).toLocaleDateString("de-DE")}</div>
                    <PhaseProgress status={f.status}/>
                    <div style={{display:"flex",gap:20,flexWrap:"wrap",marginTop:16}}>
                      {[["Bewerbungen",f.bewerbungen||0,"#3b72b8"],["Qualifiziert",f.qualifiziert||0,"#7c3aed"],["Conversion",f.conversion?`${f.conversion}%`:"–","#16a34a"],["Kosten/Bew.",f.kosten?`${f.kosten}€`:"–","#d97706"]].map(([label,value,color])=>(
                        <div key={label} style={{textAlign:"center"}}>
                          <div style={{fontSize:22,fontWeight:800,color,lineHeight:1,fontFamily:F}}>{value}</div>
                          <div style={{fontSize:10,color:"#8b9ab1",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2,fontFamily:F}}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
                    <select value={f.status||"In Bearbeitung"} onChange={e=>handleStatus(f.id,e.target.value)} style={{background:"#f5f7fa",border:"1px solid rgba(15,22,35,0.08)",borderRadius:8,padding:"6px 10px",fontSize:13,fontFamily:F,cursor:"pointer",color:"#0f1623"}}>
                      {Object.keys(STATUS_CONFIG).map(s=><option key={s}>{s}</option>)}
                    </select>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setEditFunnel({...f})} style={{background:"#eef4ff",color:"#3b72b8",border:"1px solid rgba(59,114,184,0.18)",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>Bearbeiten</button>
                      <button onClick={()=>handleDelete(f.id)} style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>Löschen</button>
                    </div>
                  </div>
                </div>
                {[f.info1,f.info2,f.info3,f.info4,f.info5].some(Boolean)&&(
                  <div style={{padding:"10px 24px",background:"#f8fafc",borderTop:"1px solid rgba(15,22,35,0.08)",display:"flex",gap:8,flexWrap:"wrap"}}>
                    {[f.info1,f.info2,f.info3,f.info4,f.info5].filter(Boolean).map((info,i)=>(
                      <span key={i} style={{background:"#fff",border:"1px solid rgba(15,22,35,0.08)",borderRadius:8,padding:"4px 10px",fontSize:12,color:"#4b5675",fontFamily:F}}>✓ {info}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab==="statistiken"&&(
          totalBew===0&&funnels.every(f=>!f.conversion&&!f.kosten)?(
            <div style={{background:"#fff",borderRadius:20,padding:"56px 32px",textAlign:"center",border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)"}}>
              <div style={{width:64,height:64,borderRadius:20,background:"#eef4ff",border:"2px solid rgba(59,114,184,0.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:28}}>📊</div>
              <h3 style={{fontFamily:F,fontSize:20,fontWeight:800,color:"#0f1623",marginBottom:10}}>Noch keine Statistiken</h3>
              <p style={{fontFamily:F,fontSize:14,color:"#4b5675",lineHeight:1.7,maxWidth:400,margin:"0 auto 8px"}}>Sobald Ihr Funnel live ist und erste Bewerbungen eingehen, sehen Sie hier alle Kennzahlen in Echtzeit.</p>
              <p style={{fontFamily:F,fontSize:13,color:"#8b9ab1"}}>Bewerbungen · Qualifizierungsrate · Conversion · Kosten pro Bewerbung</p>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20}}>
              <div style={{background:"#fff",borderRadius:18,padding:24,border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)"}}>
                <h3 style={{fontSize:15,fontWeight:700,color:"#0f1623",fontFamily:F,marginBottom:4}}>Bewerbungen pro Funnel</h3>
                <p style={{fontSize:12,color:"#8b9ab1",fontFamily:F,marginBottom:20}}>Vergleich aller Funnels</p>
                {funnels.map(f=>(
                  <div key={f.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,color:"#0f1623",fontFamily:F}}>{f.position}</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#3b72b8",fontFamily:F}}>{f.bewerbungen||0}</span>
                    </div>
                    <div style={{background:"#eef4ff",borderRadius:999,height:8}}>
                      <div style={{background:"#3b72b8",height:"100%",width:`${((parseInt(f.bewerbungen)||0)/maxBew)*100}%`,borderRadius:999,transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff",borderRadius:18,padding:24,border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)"}}>
                <h3 style={{fontSize:15,fontWeight:700,color:"#0f1623",fontFamily:F,marginBottom:20}}>Qualifizierungsrate</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div style={{background:"#eef4ff",borderRadius:12,padding:"16px 14px",textAlign:"center"}}>
                    <div style={{fontSize:34,fontWeight:800,color:"#3b72b8",lineHeight:1,fontFamily:F}}>{totalBew}</div>
                    <div style={{fontSize:11,color:"#8b9ab1",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F}}>Bewerbungen</div>
                  </div>
                  <div style={{background:"#f5f3ff",borderRadius:12,padding:"16px 14px",textAlign:"center"}}>
                    <div style={{fontSize:34,fontWeight:800,color:"#7c3aed",lineHeight:1,fontFamily:F}}>{totalQual}</div>
                    <div style={{fontSize:11,color:"#8b9ab1",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F}}>Qualifiziert</div>
                  </div>
                </div>
                {totalBew>0&&(
                  <div style={{background:"#f0fdf4",borderRadius:10,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:28,fontWeight:800,color:"#16a34a",fontFamily:F}}>{Math.round((totalQual/totalBew)*100)}%</div>
                    <div style={{fontSize:12,color:"#16a34a",fontWeight:600,fontFamily:F}}>Qualifizierungsrate</div>
                  </div>
                )}
              </div>
              <div style={{background:"#fff",borderRadius:18,padding:24,border:"1.5px solid rgba(15,22,35,0.08)",boxShadow:"0 2px 12px rgba(59,114,184,0.06)"}}>
                <h3 style={{fontSize:15,fontWeight:700,color:"#0f1623",fontFamily:F,marginBottom:20}}>Status-Übersicht</h3>
                {Object.entries(STATUS_CONFIG).map(([status,cfg])=>{
                  const count=funnels.filter(f=>(f.status||"In Bearbeitung")===status).length;
                  return(
                    <div key={status} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:cfg.bg,borderRadius:10,marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:cfg.dot,display:"inline-block"}}/>
                        <span style={{fontSize:13,fontWeight:600,color:cfg.color,fontFamily:F}}>{status}</span>
                      </div>
                      <span style={{fontSize:18,fontWeight:800,color:cfg.color,fontFamily:F}}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}