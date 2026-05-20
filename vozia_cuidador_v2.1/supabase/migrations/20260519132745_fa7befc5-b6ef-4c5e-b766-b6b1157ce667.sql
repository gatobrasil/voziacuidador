
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('familiar_admin', 'cuidador', 'paciente');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'familiar_admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients table (owned by familiar_admin)
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  diagnosis TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  doctor_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Caregivers link table
CREATE TABLE public.caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  caregiver_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, caregiver_user_id)
);
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;

-- Security definer: can current user access patient?
CREATE OR REPLACE FUNCTION public.can_access_patient(_patient_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = _patient_id
      AND (
        p.owner_id = auth.uid()
        OR p.patient_user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.caregivers c WHERE c.patient_id = p.id AND c.caregiver_user_id = auth.uid())
      )
  );
$$;

-- Patients policies
CREATE POLICY "Access own patients" ON public.patients FOR SELECT
  USING (
    owner_id = auth.uid()
    OR patient_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.caregivers c WHERE c.patient_id = id AND c.caregiver_user_id = auth.uid())
  );
CREATE POLICY "Owner insert patients" ON public.patients FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner update patients" ON public.patients FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owner delete patients" ON public.patients FOR DELETE USING (owner_id = auth.uid());

-- Caregivers policies
CREATE POLICY "View caregivers if related" ON public.caregivers FOR SELECT
  USING (
    caregiver_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.owner_id = auth.uid())
  );
CREATE POLICY "Owner manage caregivers" ON public.caregivers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owner delete caregivers" ON public.caregivers FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.owner_id = auth.uid()));

-- Medications
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  schedule_time TIME,
  frequency TEXT,
  duration TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access medications by patient" ON public.medications FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Medication logs
CREATE TYPE public.med_status AS ENUM ('administrado', 'adiado', 'nao_administrado');

CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  status med_status NOT NULL,
  notes TEXT,
  taken_by UUID REFERENCES auth.users(id),
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access med logs by patient" ON public.medication_logs FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Routines
CREATE TYPE public.routine_type AS ENUM ('banho','alimentacao','hidratacao','fisioterapia','caminhada','sono','troca_posicao');

CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  type routine_type NOT NULL,
  schedule_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access routines by patient" ON public.routines FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Routine logs
CREATE TABLE public.routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT
);
ALTER TABLE public.routine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access routine logs by patient" ON public.routine_logs FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Quick messages
CREATE TABLE public.quick_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quick_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access quick messages by patient" ON public.quick_messages FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Events
CREATE TYPE public.event_type AS ENUM ('dor','febre','pressao','glicemia','queda','agitacao','alimentacao','evacuacao','sono','observacao');

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  value TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access events by patient" ON public.events FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Daily reports
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, report_date)
);
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access daily reports by patient" ON public.daily_reports FOR ALL
  USING (public.can_access_patient(patient_id))
  WITH CHECK (public.can_access_patient(patient_id));

-- Auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'familiar_admin')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
