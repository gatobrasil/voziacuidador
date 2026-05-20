-- Registros de uso para gestão da plataforma Vozia Cuidador
create table if not exists public.platform_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  action text not null,
  area text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.platform_usage_logs enable row level security;

drop policy if exists "Usuário registra próprio uso" on public.platform_usage_logs;
create policy "Usuário registra próprio uso"
  on public.platform_usage_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Familiar visualiza uso acessível" on public.platform_usage_logs;
create policy "Familiar visualiza uso acessível"
  on public.platform_usage_logs for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role = 'familiar_admin'
    )
  );

create index if not exists idx_platform_usage_logs_created_at on public.platform_usage_logs(created_at desc);
create index if not exists idx_platform_usage_logs_user_id on public.platform_usage_logs(user_id);
create index if not exists idx_platform_usage_logs_action on public.platform_usage_logs(action);
