-- Migration 018: Supabase Storage Bucket für Kandidaten-Dokumente
-- Privater Bucket mit RLS-Policies für sicheren Zugriff

-- Storage Bucket anlegen (privat)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,                                    -- PRIVAT — kein öffentlicher Zugriff
  10485760,                                 -- 10 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
  SET
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'],
    file_size_limit    = 10485760;
-- [P10] DO UPDATE instead of DO NOTHING so existing bucket is corrected to spec-intended MIME types

-- RLS auf storage.objects ist standardmäßig aktiviert.
-- Kandidat: eigene Dateien hochladen (Pfad beginnt mit auth.uid())
CREATE POLICY "candidates_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Kandidat: eigene Dateien lesen (für Signed URLs und Listing)
CREATE POLICY "candidates_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Kandidat: eigene Dateien löschen
CREATE POLICY "candidates_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin: alle Dateien lesen (für Verifikation in Epic 7)
CREATE POLICY "admins_read_all_documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND is_admin()
  );
