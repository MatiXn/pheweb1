import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { DocumentType, UploadedDocument } from '../types'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOAD_TIMEOUT_MS = 10_000 // NFR4: 10-second upload deadline

const validateFile = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Nur PDF, JPG und PNG bis 10 MB erlaubt'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Nur PDF, JPG und PNG bis 10 MB erlaubt'
  }
  return null
}

// [P1] img.onerror handler added, URL revoked in both paths
// [P2] canvas.toBlob null handled — rejects instead of resolving with null
// [P6] guard for zero-dimension images
// [P7] white background composite so PNG transparency doesn't become black JPEG
const compressImage = async (file: File, maxWidthPx = 1920, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // [P6] Reject degenerate images (0x0 dimensions produce NaN canvas)
      if (img.width === 0 || img.height === 0) {
        reject(new Error('Ungültige Bilddimensionen'))
        return
      }

      const scale = Math.min(1, maxWidthPx / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!

      // [P7] White fill before drawImage so PNG alpha renders correctly in JPEG
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          // [P2] toBlob can return null (OOM, tainted canvas, encoding failure)
          if (!blob) {
            reject(new Error('Bildkomprimierung fehlgeschlagen'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        quality
      )
    }

    // [P1] onerror handler — revoke URL and reject instead of hanging forever
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Bild konnte nicht geladen werden'))
    }

    img.src = url
  })
}

// [D1] NFR4: Race a promise against a timeout; rejects with 'UPLOAD_TIMEOUT' if exceeded
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timerId: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => reject(new Error('UPLOAD_TIMEOUT')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId))
}

export function useDocumentUpload() {
  // [P3] Counter-based loading state — concurrent ops each hold a count;
  //       isLoading stays true until all concurrent operations complete
  const [loadingCount, setLoadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const isLoading = loadingCount > 0
  const inc = () => setLoadingCount((c) => c + 1)
  const dec = () => setLoadingCount((c) => c - 1)

  const uploadDocument = async (file: File, documentType: DocumentType): Promise<boolean> => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return false
    }

    inc()
    setError(null)
    setUploadProgress(0)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return false
      }

      // Datei vorbereiten (Bilder komprimieren)
      let uploadFile: File | Blob = file
      let mimeType = file.type
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        try {
          uploadFile = await compressImage(file)
          mimeType = 'image/jpeg'
        } catch {
          setError('Bild konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.')
          return false
        }
      }

      // Dateiname und Pfad generieren
      const ext = mimeType === 'application/pdf' ? 'pdf' : 'jpg'
      const filename = `${crypto.randomUUID()}.${ext}`
      const storagePath = `${user.id}/${filename}`

      // [D1] Storage Upload mit 10s Timeout (NFR4)
      let uploadError: { message: string } | null = null
      try {
        const result = await withTimeout(
          supabase.storage
            .from('documents')
            .upload(storagePath, uploadFile, { contentType: mimeType, upsert: false }),
          UPLOAD_TIMEOUT_MS
        )
        uploadError = result.error
      } catch (err) {
        if (err instanceof Error && err.message === 'UPLOAD_TIMEOUT') {
          // Best-effort cleanup of any partial upload before returning error
          supabase.storage.from('documents').remove([storagePath]).catch(() => {})
          setError('Upload dauerte zu lange. Bitte versuchen Sie es erneut.')
          return false
        }
        setError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }

      if (uploadError) {
        setError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }

      setUploadProgress(80)

      // [P8] AC1: verified: false explicitly set — do not rely on DB default alone
      const { error: dbError } = await supabase.from('documents').insert({
        candidate_id: user.id,
        storage_path: storagePath,
        document_type: documentType,
        original_filename: file.name,
        file_size_bytes: Math.round((uploadFile as Blob).size),
        verified: false,
      })
      if (dbError) {
        // [P9] Rollback: Storage-Datei löschen — log if cleanup also fails
        const { error: rollbackError } = await supabase.storage
          .from('documents')
          .remove([storagePath])
        if (rollbackError) {
          console.error('[useDocumentUpload] Rollback failed — orphaned file:', storagePath, rollbackError.message)
        }
        setError('Dokument konnte nicht gespeichert werden.')
        return false
      }

      setUploadProgress(100)
      return true
    } finally {
      dec()
    }
  }

  const loadDocuments = async (): Promise<UploadedDocument[]> => {
    inc()
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select(
          'id, document_type, original_filename, file_size_bytes, verified, verified_at, created_at, storage_path'
        )
        .eq('candidate_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError('Dokumente konnten nicht geladen werden.')
        return []
      }

      return (data ?? []).map((row) => ({
        id: row.id as string,
        documentType: row.document_type as DocumentType,
        originalFilename: row.original_filename as string | null,
        fileSizeBytes: row.file_size_bytes as number | null,
        verified: row.verified as boolean,
        verifiedAt: row.verified_at as string | null,
        createdAt: row.created_at as string,
        storagePath: row.storage_path as string,
      }))
    } finally {
      dec()
    }
  }

  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    const { data, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600) // 1 Stunde (NFR23)
    if (signError) return null
    return data?.signedUrl ?? null
  }

  // [P4] DB deleted first — if storage delete subsequently fails, the DB row is gone
  //      (document invisible to user) and orphaned storage file is logged for cleanup
  const deleteDocument = async (id: string, storagePath: string): Promise<boolean> => {
    inc()
    setError(null)
    try {
      // Step 1: DB row first
      const { error: dbError } = await supabase.from('documents').delete().eq('id', id)
      if (dbError) {
        setError('Dokument-Eintrag konnte nicht gelöscht werden.')
        return false
      }

      // Step 2: Storage file — if this fails, DB row is already gone (acceptable)
      const { error: storageError } = await supabase.storage.from('documents').remove([storagePath])
      if (storageError) {
        console.error('[useDocumentUpload] Storage delete failed after DB delete — orphaned file:', storagePath, storageError.message)
        // Return true anyway: document is invisible to user (DB row gone)
      }

      return true
    } finally {
      dec()
    }
  }

  // [Story 3.5] Replace an existing document:
  // 1. Delete old DB row + Storage (via deleteDocument)
  // 2. Upload new file to Storage
  // 3. Insert new documents row
  // 4. Call SECURITY DEFINER RPC to write audit log + reset profile_status
  const replaceDocument = async (
    oldId: string,
    oldPath: string,
    file: File,
    documentType: DocumentType
  ): Promise<boolean> => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return false
    }

    inc()
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return false
      }

      // Step 1: Delete old document inline (F17: avoids nested inc/dec from deleteDocument)
      // DB-first: if storage delete fails, the orphaned file can be cleaned up later
      const { error: dbDelError } = await supabase.from('documents').delete().eq('id', oldId)
      if (dbDelError) {
        setError('Dokument-Eintrag konnte nicht gelöscht werden.')
        return false
      }
      const { error: storageDelError } = await supabase.storage.from('documents').remove([oldPath])
      if (storageDelError) {
        console.error('[useDocumentUpload] Storage delete failed after DB delete — orphaned file:', oldPath, storageDelError.message)
        // Continue: DB row gone, orphaned storage file is acceptable
      }

      // Step 2: Prepare new file (compress images)
      let uploadFile: File | Blob = file
      let mimeType = file.type
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        try {
          uploadFile = await compressImage(file)
          mimeType = 'image/jpeg'
        } catch {
          setError('Bild konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.')
          return false
        }
      }

      // Step 3: Generate new storage path
      const ext = mimeType === 'application/pdf' ? 'pdf' : 'jpg'
      const filename = `${crypto.randomUUID()}.${ext}`
      const newStoragePath = `${user.id}/${filename}`

      // Step 4: Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(newStoragePath, uploadFile, { contentType: mimeType, upsert: false })
      if (uploadError) {
        setError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }

      // Step 5: Insert new DB row (capture id for rollback in step 6)
      const { data: newDoc, error: dbError } = await supabase.from('documents').insert({
        candidate_id: user.id,
        storage_path: newStoragePath,
        document_type: documentType,
        original_filename: file.name,
        file_size_bytes: Math.round((uploadFile as Blob).size),
        verified: false,
      }).select('id').single()
      if (dbError || !newDoc) {
        // Rollback storage upload
        await supabase.storage.from('documents').remove([newStoragePath])
        setError('Dokument konnte nicht gespeichert werden.')
        return false
      }

      // Step 6: Audit log + profile_status reset via SECURITY DEFINER RPC
      // F03: on RPC failure, rollback the new document so state stays consistent
      const { error: rpcError } = await supabase.rpc('candidate_log_document_replaced', {
        p_document_type: documentType,
        p_old_path: oldPath,
        p_new_path: newStoragePath,
      })
      if (rpcError) {
        // Rollback: remove new DB row and storage file
        await supabase.from('documents').delete().eq('id', newDoc.id)
        await supabase.storage.from('documents').remove([newStoragePath])
        setError('Dokument konnte nicht ersetzt werden. Bitte versuchen Sie es erneut.')
        return false
      }

      return true
    } finally {
      dec()
    }
  }

  return {
    isLoading,
    error,
    uploadProgress,
    uploadDocument,
    loadDocuments,
    getSignedUrl,
    deleteDocument,
    replaceDocument,
  }
}
