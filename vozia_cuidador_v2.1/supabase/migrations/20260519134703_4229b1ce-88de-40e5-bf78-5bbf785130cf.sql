
DROP POLICY IF EXISTS "Access own patients" ON public.patients;

CREATE OR REPLACE FUNCTION public.is_caregiver_of(_patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.caregivers c WHERE c.patient_id = _patient_id AND c.caregiver_user_id = auth.uid());
$$;

CREATE POLICY "Access own patients" ON public.patients FOR SELECT
USING (
  owner_id = auth.uid()
  OR patient_user_id = auth.uid()
  OR public.is_caregiver_of(id)
);
