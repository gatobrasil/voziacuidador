
DROP POLICY IF EXISTS "Public read patient photos" ON storage.objects;

CREATE POLICY "Authenticated read patient photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-photos');

UPDATE storage.buckets SET public = false WHERE id = 'patient-photos';
