
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS photo_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read patient photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-photos');

CREATE POLICY "Users upload own patient photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own patient photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own patient photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE OR REPLACE FUNCTION public.touch_patients_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS patients_updated_at ON public.patients;
CREATE TRIGGER patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.touch_patients_updated_at();
