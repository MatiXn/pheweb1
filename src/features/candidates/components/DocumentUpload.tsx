import { useEffect, useRef, useState } from 'react'
import { useDocumentUpload } from '../hooks/useDocumentUpload'
import type { DocumentType, UploadedDocument } from '../types'

const C = {
  accent: '#3b72b8',
  accentHover: '#2d5a9e',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
  cardSelected: '#3b72b8',
  cardSelectedBg: '#eff5fd',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  greenBorder: '#bbf7d0',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBorder: '#fde68a',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  lebenslauf: 'Lebenslauf',
  zeugnis: 'Zeugnis',
  zertifikat: 'Zertifikat',
  sonstiges: 'Sonstiges',
}

const DOCUMENT_TYPES: DocumentType[] = ['lebenslauf', 'zeugnis', 'zertifikat', 'sonstiges']

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function DocumentUpload() {
  const { isLoading, error, uploadProgress, uploadDocument, loadDocuments, deleteDocument } =
    useDocumentUpload()
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      const docs = await loadDocuments()
      setDocuments(docs)
      setDocsLoading(false)
    })()
    // loadDocuments ref is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelected = async (file: File | null | undefined) => {
    if (!file) return
    if (!selectedType) {
      // Show type selection hint — handled via UI (button disabled)
      return
    }
    setSuccessMessage(null)
    const ok = await uploadDocument(file, selectedType)
    if (ok) {
      setSuccessMessage('Dokument hochgeladen — wird geprüft')
      // [P5] Reset docsLoading so the list shows a loading state during reload
      setDocsLoading(true)
      const docs = await loadDocuments()
      setDocuments(docs)
      setDocsLoading(false)
      setSelectedType(null)
    }
  }

  const handleDelete = async (doc: UploadedDocument) => {
    if (!window.confirm(`„${doc.originalFilename ?? 'Dokument'}" wirklich löschen?`)) return
    const ok = await deleteDocument(doc.id, doc.storagePath)
    if (ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
    }
  }

  return (
    <div
      style={{
        fontFamily: F,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8faff 0%, #eef3fb 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px 60px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: C.accent,
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}
        >
          pheweb
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: C.text,
            margin: 0,
            letterSpacing: '-0.5px',
          }}
        >
          Dokumente hochladen
        </h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>
          Laden Sie Ihre Qualifikationsnachweise hoch — PDF, JPG oder PNG bis 10 MB
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: C.shadowLg,
          padding: '32px 28px',
          width: '100%',
          maxWidth: 560,
        }}
      >
        {/* Step 1: Dokumenttyp wählen */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            1. Dokumenttyp wählen
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            {DOCUMENT_TYPES.map((type) => {
              const isSelected = selectedType === type
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${isSelected ? C.cardSelected : C.border}`,
                    background: isSelected ? C.cardSelectedBg : '#fafbfd',
                    color: isSelected ? C.accent : C.text,
                    fontFamily: F,
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {DOCUMENT_TYPE_LABELS[type]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Datei hochladen */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            2. Datei hochladen
          </p>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
            onClick={(e) => {
              // Reset value so same file can be re-selected
              ;(e.target as HTMLInputElement).value = ''
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
            onClick={(e) => {
              ;(e.target as HTMLInputElement).value = ''
            }}
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedType || isLoading}
              style={{
                flex: 1,
                minWidth: 140,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: !selectedType || isLoading ? '#e2e8f0' : C.accent,
                color: !selectedType || isLoading ? C.faint : '#fff',
                fontFamily: F,
                fontSize: 14,
                fontWeight: 600,
                cursor: !selectedType || isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {isLoading ? `Hochladen… ${uploadProgress}%` : 'Datei auswählen'}
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={!selectedType || isLoading}
              style={{
                flex: 1,
                minWidth: 140,
                padding: '12px 20px',
                borderRadius: 10,
                border: `2px solid ${!selectedType || isLoading ? C.border : C.accent}`,
                background: '#fff',
                color: !selectedType || isLoading ? C.faint : C.accent,
                fontFamily: F,
                fontSize: 14,
                fontWeight: 600,
                cursor: !selectedType || isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📷 Foto aufnehmen
            </button>
          </div>

          {!selectedType && (
            <p style={{ fontSize: 12, color: C.faint, marginTop: 8 }}>
              Bitte zuerst einen Dokumenttyp auswählen.
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: C.redBg,
              border: `1px solid ${C.redBorder}`,
              borderRadius: 10,
              padding: '12px 16px',
              color: C.red,
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            style={{
              background: C.greenBg,
              border: `1px solid ${C.greenBorder}`,
              borderRadius: 10,
              padding: '12px 16px',
              color: C.green,
              fontSize: 14,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: C.border, margin: '8px 0 24px' }} />

        {/* Dokumentenliste */}
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            Meine Dokumente
          </p>

          {docsLoading && (
            <p style={{ color: C.faint, fontSize: 14 }}>Dokumente werden geladen…</p>
          )}

          {!docsLoading && documents.length === 0 && (
            <p style={{ color: C.faint, fontSize: 14 }}>
              Noch keine Dokumente hochgeladen.
            </p>
          )}

          {!docsLoading &&
            documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                {/* Type badge */}
                <span
                  style={{
                    background: C.cardSelectedBg,
                    color: C.accent,
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {DOCUMENT_TYPE_LABELS[doc.documentType]}
                </span>

                {/* File info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: C.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {doc.originalFilename ?? 'Dokument'}
                  </div>
                  <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>
                    {formatFileSize(doc.fileSizeBytes)} · {formatDate(doc.createdAt)}
                  </div>

                  {/* Verification status */}
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: doc.verified ? C.greenBg : C.amberBg,
                      color: doc.verified ? C.green : C.amber,
                      border: `1px solid ${doc.verified ? C.greenBorder : C.amberBorder}`,
                    }}
                  >
                    {doc.verified ? '✓ Verifiziert' : '⏳ Wird geprüft'}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.red,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontFamily: F,
                    fontWeight: 500,
                    padding: '2px 0',
                    flexShrink: 0,
                  }}
                >
                  Löschen
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
