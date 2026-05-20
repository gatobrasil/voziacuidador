-- VOZIA CUIDADOR - SQL DEFINITIVO PARA ALINHAR O SUPABASE AO FRONTEND
-- Rode este arquivo inteiro no Supabase > SQL Editor > New query > Run.

-- 1) ENUMS seguros
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('familiar_admin', 'cuidador', 'paciente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE med_status AS ENUM ('administrado', 'adiado', 'nao_administrado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE routine_type AS ENUM ('banho', 'alimentacao', 'hidratacao', 'fisioterapia', 'caminhada', 'sono', 'troca_posicao');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('dor', 'febre', 'pressao', 'glicemia', 'queda', 'agitacao', 'alimentacao', 'evacuacao', 'sono', 'observacao');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2) PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  full_name text not null,
  phone text,
  role app_role default 'familiar_admin'
);

-- 3) PATIENTS
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  owner_id uuid,
  patient_user_id uuid,
  full_name text,
  name text,
  age integer,
  birth_date date,
  diagnosis text,
  chronic_conditions text,
  continuous_medications text,
  allergies text,
  blood_type text,
  emergency_contact text,
  emergency_phone text,
  doctor_name text,
  notes text,
  address text,
  caregiver_name text,
  caregiver_phone text,
  condition text,
  cpf text,
  gender text,
  mobility text,
  communication_level text,
  risk_level text default 'baixo',
  photo_url text,
  active boolean default true
);

alter table patients
add column if not exists updated_at timestamptz default now(),
add column if not exists owner_id uuid,
add column if not exists patient_user_id uuid,
add column if not exists full_name text,
add column if not exists name text,
add column if not exists age integer,
add column if not exists birth_date date,
add column if not exists diagnosis text,
add column if not exists chronic_conditions text,
add column if not exists continuous_medications text,
add column if not exists allergies text,
add column if not exists blood_type text,
add column if not exists emergency_contact text,
add column if not exists emergency_phone text,
add column if not exists doctor_name text,
add column if not exists notes text,
add column if not exists address text,
add column if not exists caregiver_name text,
add column if not exists caregiver_phone text,
add column if not exists condition text,
add column if not exists cpf text,
add column if not exists gender text,
add column if not exists mobility text,
add column if not exists communication_level text,
add column if not exists risk_level text default 'baixo',
add column if not exists photo_url text,
add column if not exists active boolean default true;

alter table patients alter column name drop not null;
alter table patients alter column full_name drop not null;
update patients set full_name = coalesce(full_name, name, 'Paciente sem nome') where full_name is null;
update patients set name = coalesce(name, full_name) where name is null;

-- 4) MEDICATIONS
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  owner_id uuid,
  recorded_by uuid,
  name text not null,
  medication_name text,
  dose text,
  dosage text,
  route text,
  schedule_time text,
  frequency text,
  duration text,
  start_date date,
  end_date date,
  instructions text,
  continuous_use boolean default false,
  alarm_enabled boolean default true,
  times_per_day integer,
  interval_hours integer,
  notes text,
  status text default 'ativo',
  active boolean default true
);

alter table medications
add column if not exists owner_id uuid,
add column if not exists recorded_by uuid,
add column if not exists medication_name text,
add column if not exists dose text,
add column if not exists dosage text,
add column if not exists route text,
add column if not exists schedule_time text,
add column if not exists frequency text,
add column if not exists duration text,
add column if not exists start_date date,
add column if not exists end_date date,
add column if not exists instructions text,
add column if not exists continuous_use boolean default false,
add column if not exists alarm_enabled boolean default true,
add column if not exists times_per_day integer,
add column if not exists interval_hours integer,
add column if not exists notes text,
add column if not exists status text default 'ativo',
add column if not exists active boolean default true;

-- 5) MEDICATION LOGS
create table if not exists medication_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  medication_id uuid references medications(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  status med_status,
  taken_at timestamptz default now(),
  taken_by uuid,
  recorded_by uuid,
  scheduled_time text,
  note text,
  notes text
);

alter table medication_logs
add column if not exists created_at timestamptz default now(),
add column if not exists medication_id uuid,
add column if not exists patient_id uuid,
add column if not exists status med_status,
add column if not exists taken_at timestamptz default now(),
add column if not exists taken_by uuid,
add column if not exists recorded_by uuid,
add column if not exists scheduled_time text,
add column if not exists note text,
add column if not exists notes text;

-- 6) ROUTINES AND ROUTINE LOGS
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  owner_id uuid,
  type routine_type,
  title text,
  schedule_time text,
  scheduled_time time,
  category text,
  notes text,
  active boolean default true
);

alter table routines
add column if not exists owner_id uuid,
add column if not exists type routine_type,
add column if not exists title text,
add column if not exists schedule_time text,
add column if not exists scheduled_time time,
add column if not exists category text,
add column if not exists notes text,
add column if not exists active boolean default true;

create table if not exists routine_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  routine_id uuid references routines(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  completed_at timestamptz default now(),
  completed_by uuid,
  recorded_by uuid,
  status text,
  note text,
  notes text
);

alter table routine_logs
add column if not exists created_at timestamptz default now(),
add column if not exists routine_id uuid,
add column if not exists patient_id uuid,
add column if not exists completed_at timestamptz default now(),
add column if not exists completed_by uuid,
add column if not exists recorded_by uuid,
add column if not exists status text,
add column if not exists note text,
add column if not exists notes text;

-- 7) EVENTS
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  type event_type,
  value text,
  description text,
  severity text default 'normal',
  occurred_at timestamptz default now(),
  recorded_by uuid,
  notes text
);

alter table events
add column if not exists created_at timestamptz default now(),
add column if not exists type event_type,
add column if not exists value text,
add column if not exists description text,
add column if not exists severity text default 'normal',
add column if not exists occurred_at timestamptz default now(),
add column if not exists recorded_by uuid,
add column if not exists notes text;

-- 8) QUICK MESSAGES
create table if not exists quick_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  message text not null,
  sent_by uuid
);

alter table quick_messages
add column if not exists created_at timestamptz default now(),
add column if not exists patient_id uuid,
add column if not exists message text,
add column if not exists sent_by uuid;

-- 9) VITALS
create table if not exists vitals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  measured_at timestamptz default now(),
  recorded_by uuid,
  systolic integer,
  diastolic integer,
  heart_rate integer,
  glucose integer,
  temperature numeric,
  oxygen_saturation integer,
  pain_level integer,
  weight numeric,
  respiratory_rate integer,
  notes text
);

alter table vitals
add column if not exists created_at timestamptz default now(),
add column if not exists patient_id uuid,
add column if not exists measured_at timestamptz default now(),
add column if not exists recorded_by uuid,
add column if not exists systolic integer,
add column if not exists diastolic integer,
add column if not exists heart_rate integer,
add column if not exists glucose integer,
add column if not exists temperature numeric,
add column if not exists oxygen_saturation integer,
add column if not exists pain_level integer,
add column if not exists weight numeric,
add column if not exists respiratory_rate integer,
add column if not exists notes text;

-- 10) GESTAO / USAGE LOGS
create table if not exists platform_usage_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid,
  patient_id uuid,
  action text,
  area text,
  metadata jsonb
);

-- 11) CAREGIVER LINKS
create table if not exists caregiver_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  token text unique,
  active boolean default true
);

-- 12) DAILY REPORTS
create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  patient_id uuid references patients(id) on delete cascade,
  report_date date default current_date,
  summary text
);

-- 13) STORAGE BUCKET PARA FOTO DO PACIENTE
insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', false)
on conflict (id) do nothing;

-- 14) RLS - MVP LOCAL: liberar tudo para authenticated
-- Depois da validação comercial, endurecemos para owner_id/caregiver_links.
alter table profiles enable row level security;
alter table patients enable row level security;
alter table medications enable row level security;
alter table medication_logs enable row level security;
alter table routines enable row level security;
alter table routine_logs enable row level security;
alter table events enable row level security;
alter table quick_messages enable row level security;
alter table vitals enable row level security;
alter table platform_usage_logs enable row level security;
alter table caregiver_links enable row level security;
alter table daily_reports enable row level security;

-- Profiles: acesso próprio + liberado para MVP
DROP POLICY IF EXISTS "Allow authenticated profiles" ON profiles;
CREATE POLICY "Allow authenticated profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated patients" ON patients;
CREATE POLICY "Allow authenticated patients" ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated medications" ON medications;
CREATE POLICY "Allow authenticated medications" ON medications FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated medication logs" ON medication_logs;
CREATE POLICY "Allow authenticated medication logs" ON medication_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated routines" ON routines;
CREATE POLICY "Allow authenticated routines" ON routines FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated routine logs" ON routine_logs;
CREATE POLICY "Allow authenticated routine logs" ON routine_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated events" ON events;
CREATE POLICY "Allow authenticated events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated quick messages" ON quick_messages;
CREATE POLICY "Allow authenticated quick messages" ON quick_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated vitals" ON vitals;
CREATE POLICY "Allow authenticated vitals" ON vitals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated usage logs" ON platform_usage_logs;
CREATE POLICY "Allow authenticated usage logs" ON platform_usage_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated caregiver links" ON caregiver_links;
CREATE POLICY "Allow authenticated caregiver links" ON caregiver_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated daily reports" ON daily_reports;
CREATE POLICY "Allow authenticated daily reports" ON daily_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage policies para fotos
DROP POLICY IF EXISTS "Allow authenticated patient photo select" ON storage.objects;
CREATE POLICY "Allow authenticated patient photo select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'patient-photos');

DROP POLICY IF EXISTS "Allow authenticated patient photo insert" ON storage.objects;
CREATE POLICY "Allow authenticated patient photo insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-photos');

DROP POLICY IF EXISTS "Allow authenticated patient photo update" ON storage.objects;
CREATE POLICY "Allow authenticated patient photo update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'patient-photos') WITH CHECK (bucket_id = 'patient-photos');

-- 15) Recarrega cache do PostgREST
NOTIFY pgrst, 'reload schema';
