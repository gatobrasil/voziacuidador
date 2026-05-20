
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS chronic_conditions text,
  ADD COLUMN IF NOT EXISTS continuous_medications text;

CREATE TABLE IF NOT EXISTS public.vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  measured_at timestamptz NOT NULL DEFAULT now(),
  systolic int,
  diastolic int,
  heart_rate int,
  glucose numeric,
  temperature numeric,
  oxygen_saturation int,
  weight numeric,
  pain_level int,
  notes text,
  recorded_by uuid
);

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access vitals by patient"
ON public.vitals FOR ALL
USING (public.can_access_patient(patient_id))
WITH CHECK (public.can_access_patient(patient_id));

CREATE INDEX IF NOT EXISTS idx_vitals_patient_time ON public.vitals(patient_id, measured_at DESC);
