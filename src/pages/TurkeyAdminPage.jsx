import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  red: "#C0392B",
  redBg: "rgba(192,57,43,0.08)",
  green: "#27AE60",
  greenBg: "rgba(39,174,96,0.08)",
};

const F = "'Bricolage Grotesque', 'Helvetica Neue', sans-serif";
const FH = "'DM Serif Display', Georgia, serif";

function formatBytes(bytes) {
  if (!bytes) return "–";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(str) {
  if (!str) return "–";
  return new Date(str).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TurkeyAdminPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mediaList, setMediaList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const [deleting, setDeleting] = useState(null); // item id being deleted
  const [deleteError, setDeleteError] = useState(null);

  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // ── Auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          navigate("/login");
        } else {
          setUser(data.user);
        }
      } catch {
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [navigate]);

  // ── Load media list
  useEffect(() => {
    if (user) loadMedia();
  }, [user]);

  async function loadMedia() {
    setListLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("land_gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMediaList(data || []);
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setListLoading(false);
    }
  }

  // ── Upload handler
  async function handleFiles(files) {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    const fileArr = Array.from(files);
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      setUploadProgress(Math.round(((i) / fileArr.length) * 90));

      try {
        const path = `public/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

        const { error: uploadErr } = await supabase.storage
          .from("land-media")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("land-media")
          .getPublicUrl(path);

        const url = urlData?.publicUrl;
        if (!url) throw new Error("Could not get public URL");

        const type = file.type.startsWith("video") ? "video" : "image";

        const { error: insertErr } = await supabaseClient
          .from("land_gallery")
          .insert([{ url, storage_path: path, type, title: file.name }]);

        if (insertErr) throw insertErr;

        succeeded++;
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        failed++;
      }
    }

    setUploadProgress(100);

    if (succeeded > 0 && failed === 0) {
      setUploadSuccess(`${succeeded} Datei${succeeded > 1 ? "en" : ""} erfolgreich hochgeladen.`);
    } else if (succeeded > 0 && failed > 0) {
      setUploadSuccess(`${succeeded} hochgeladen, ${failed} fehlgeschlagen.`);
      setUploadError(`${failed} Datei${failed > 1 ? "en konnten" : " konnte"} nicht hochgeladen werden.`);
    } else {
      setUploadError("Upload fehlgeschlagen. Bitte versuchen Sie es erneut.");
    }

    setUploading(false);
    await loadMedia();

    setTimeout(() => {
      setUploadProgress(0);
      setUploadSuccess(null);
    }, 4000);
  }

  // ── Delete handler
  async function handleDelete(item) {
    setDeleting(item.id);
    setDeleteError(null);
    try {
      // Remove from table
      const { error: dbErr } = await supabaseClient
        .from("land_gallery")
        .delete()
        .eq("id", item.id);
      if (dbErr) throw dbErr;

      // Remove from storage
      if (item.storage_path) {
        await supabase.storage
          .from("land-media")
          .remove([item.storage_path]);
      }

      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Löschen fehlgeschlagen: " + (err.message || "Unbekannter Fehler"));
    } finally {
      setDeleting(null);
    }
  }

  // ── Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // ── Stats
  const totalImages = mediaList.filter((m) => m.type === "image").length;
  const totalVideos = mediaList.filter((m) => m.type === "video").length;

  // ── Drag handlers
  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave() {
    setDragOver(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  if (authLoading) {
    return (
      <div
        style={{
          fontFamily: F,
          background: C.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.muted,
          fontSize: 15,
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=DM+Serif+Display:ital@0;1&display=swap');`}</style>
        Authentifizierung wird geprüft…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ fontFamily: F, background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        .admin-delete-btn:hover { background: ${C.red} !important; color: white !important; border-color: ${C.red} !important; }
        .admin-logout-btn:hover { background: rgba(26,24,22,0.06) !important; }
        .admin-media-card:hover { box-shadow: 0 4px 20px rgba(26,24,22,0.10) !important; }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header
        style={{
          background: C.bgDark,
          padding: "0 40px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid rgba(184,149,90,0.15)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <span
            style={{
              fontFamily: F,
              fontSize: 12,
              fontWeight: 600,
              color: C.stone,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Admin
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              fontSize: 13,
              color: C.stone,
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="admin-logout-btn"
            style={{
              background: "none",
              border: `1px solid rgba(255,255,255,0.12)`,
              color: C.faint,
              padding: "8px 16px",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: F,
              transition: "background 0.2s",
            }}
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: FH,
              fontSize: 36,
              fontWeight: 400,
              color: C.text,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Medien verwalten
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>
            Bilder und Videos für die Grundstücks-Galerie hochladen und verwalten.
          </p>
        </div>

        {/* ── STATS ROW ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[
            { label: "Gesamt", value: mediaList.length, icon: "▦" },
            { label: "Bilder", value: totalImages, icon: "🖼" },
            { label: "Videos", value: totalVideos, icon: "▶" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: C.goldBg,
                  border: `1px solid ${C.goldBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FH,
                    fontSize: 28,
                    color: C.gold,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.06em" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── UPLOAD ZONE ───────────────────────────────────────────── */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "32px",
            marginBottom: 40,
            boxShadow: C.shadow,
          }}
        >
          <h2
            style={{
              fontFamily: FH,
              fontSize: 22,
              fontWeight: 400,
              color: C.text,
              marginBottom: 20,
            }}
          >
            Dateien hochladen
          </h2>

          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? C.gold : C.goldBorder}`,
              borderRadius: 8,
              padding: "60px 40px",
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              background: dragOver ? C.goldBg : C.bgSection,
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Upload icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: C.goldBg,
                border: `1px solid ${C.goldBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div
              style={{
                fontFamily: F,
                fontSize: 16,
                fontWeight: 600,
                color: C.text,
                marginBottom: 8,
              }}
            >
              {uploading ? "Wird hochgeladen…" : "Dateien hier ablegen oder klicken"}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              Bilder (JPG, PNG, WebP) und Videos (MP4, MOV) · Mehrere Dateien möglich
            </div>

            {/* Progress bar */}
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: C.bgSection,
                  borderRadius: "0 0 8px 8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress}%`,
                    background: C.gold,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
          </div>

          {/* Upload progress detail */}
          {uploading && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: C.bgSection,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${uploadProgress}%`,
                    background: C.gold,
                    transition: "width 0.3s ease",
                    borderRadius: 2,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.gold,
                  minWidth: 40,
                }}
              >
                {uploadProgress}%
              </span>
            </div>
          )}

          {/* Success/Error messages */}
          {uploadSuccess && !uploading && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: C.greenBg,
                border: `1px solid rgba(39,174,96,0.2)`,
                borderRadius: 6,
                fontSize: 14,
                color: C.green,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>✓</span>
              {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: C.redBg,
                border: `1px solid rgba(192,57,43,0.2)`,
                borderRadius: 6,
                fontSize: 14,
                color: C.red,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>✕</span>
              {uploadError}
            </div>
          )}
        </div>

        {/* ── MEDIA GRID ────────────────────────────────────────────── */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "32px",
            boxShadow: C.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontFamily: FH,
                fontSize: 22,
                fontWeight: 400,
                color: C.text,
              }}
            >
              Alle Medien
            </h2>
            <button
              onClick={loadMedia}
              disabled={listLoading}
              style={{
                background: "none",
                border: `1px solid ${C.border}`,
                color: C.muted,
                padding: "8px 16px",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                cursor: listLoading ? "not-allowed" : "pointer",
                fontFamily: F,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ display: "inline-block", transform: listLoading ? "rotate(360deg)" : "none" }}>
                ↻
              </span>
              Aktualisieren
            </button>
          </div>

          {/* Delete error */}
          {deleteError && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                background: C.redBg,
                border: `1px solid rgba(192,57,43,0.2)`,
                borderRadius: 6,
                fontSize: 14,
                color: C.red,
              }}
            >
              {deleteError}
            </div>
          )}

          {listLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: C.muted,
                fontSize: 14,
              }}
            >
              Wird geladen…
            </div>
          ) : mediaList.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 40px",
                border: `1px dashed ${C.goldBorder}`,
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  fontFamily: FH,
                  fontSize: 20,
                  color: C.faint,
                  marginBottom: 8,
                  fontStyle: "italic",
                }}
              >
                Noch keine Medien
              </div>
              <p style={{ fontSize: 13, color: C.faint }}>
                Laden Sie Bilder oder Videos hoch, um sie hier anzuzeigen.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  className="admin-media-card"
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    overflow: "hidden",
                    background: C.bg,
                    transition: "box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      height: 160,
                      background: C.bgSection,
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || "Media"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {/* Type badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        padding: "3px 8px",
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: item.type === "video"
                          ? "rgba(26,24,22,0.75)"
                          : "rgba(184,149,90,0.85)",
                        color: C.white,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {item.type === "video" ? "▶ Video" : "Bild"}
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      padding: "14px 16px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.title}
                    >
                      {item.title || "Unbenannt"}
                    </div>
                    <div style={{ fontSize: 11, color: C.faint }}>
                      {formatDate(item.created_at)}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                      className="admin-delete-btn"
                      style={{
                        marginTop: 8,
                        background: "none",
                        border: `1px solid rgba(192,57,43,0.3)`,
                        color: C.red,
                        padding: "7px 12px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: deleting === item.id ? "not-allowed" : "pointer",
                        fontFamily: F,
                        transition: "all 0.2s",
                        opacity: deleting === item.id ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        justifyContent: "center",
                      }}
                    >
                      {deleting === item.id ? (
                        <>
                          <span>↻</span>
                          Wird gelöscht…
                        </>
                      ) : (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                          Löschen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
