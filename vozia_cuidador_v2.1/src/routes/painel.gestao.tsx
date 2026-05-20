import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart3, Download, FileText, ShieldAlert, Users, UserRound, Pill, Activity, ClipboardCheck, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { trackUsage } from "@/lib/usage-tracker";
console.log('Supabase conectado:', supabase)

export const Route = createFileRoute("/painel/gestao")({
  component: GestaoPage,
});

type DayMetric = { date: string; events: number; meds: number; routines: number; vitals: number; usage: number };

type RecentRow = { type: string; detail: string; date: string };

function startOfDayISO(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function dateKey(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDateBR(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function GestaoPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ patients: 0, users: 0, meds: 0, events: 0, routines: 0, vitals: 0, usageToday: 0 });
  const [days, setDays] = useState<DayMetric[]>([]);
  const [recent, setRecent] = useState<RecentRow[]>([]);

  useEffect(() => {
    trackUsage("page_view", "gestao");
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    const today = startOfDayISO(0);
    const last7 = startOfDayISO(6);

    const [patients, users, meds, events, routines, vitals, usageToday, usage7, ev7, med7, routine7, vitals7] = await Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("medications").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("routines").select("id", { count: "exact", head: true }),
      supabase.from("vitals").select("id", { count: "exact", head: true }),
      (supabase as any).from("platform_usage_logs").select("id", { count: "exact", head: true }).gte("created_at", today),
      (supabase as any).from("platform_usage_logs").select("created_at, action, area").gte("created_at", last7).order("created_at", { ascending: false }).limit(200),
      supabase.from("events").select("occurred_at, type, value, notes").gte("occurred_at", last7).order("occurred_at", { ascending: false }).limit(100),
      supabase.from("medication_logs").select("taken_at, status, notes").gte("taken_at", last7).order("taken_at", { ascending: false }).limit(100),
      supabase.from("routine_logs").select("completed_at, notes").gte("completed_at", last7).order("completed_at", { ascending: false }).limit(100),
      supabase.from("vitals").select("measured_at, systolic, diastolic, glucose, temperature, oxygen_saturation, pain_level").gte("measured_at", last7).order("measured_at", { ascending: false }).limit(100),
    ]);

    setTotals({
      patients: patients.count ?? 0,
      users: users.count ?? 0,
      meds: meds.count ?? 0,
      events: events.count ?? 0,
      routines: routines.count ?? 0,
      vitals: vitals.count ?? 0,
      usageToday: usageToday.count ?? 0,
    });

    const base: Record<string, DayMetric> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      base[key] = { date: key, events: 0, meds: 0, routines: 0, vitals: 0, usage: 0 };
    }

    ((usage7.data as any[]) ?? []).forEach((r) => { const k = dateKey(r.created_at); if (base[k]) base[k].usage++; });
    ((ev7.data as any[]) ?? []).forEach((r) => { const k = dateKey(r.occurred_at); if (base[k]) base[k].events++; });
    ((med7.data as any[]) ?? []).forEach((r) => { const k = dateKey(r.taken_at); if (base[k]) base[k].meds++; });
    ((routine7.data as any[]) ?? []).forEach((r) => { const k = dateKey(r.completed_at); if (base[k]) base[k].routines++; });
    ((vitals7.data as any[]) ?? []).forEach((r) => { const k = dateKey(r.measured_at); if (base[k]) base[k].vitals++; });
    setDays(Object.values(base));

    const rows: RecentRow[] = [
      ...(((ev7.data as any[]) ?? []).slice(0, 12).map((e) => ({ type: "Evento", detail: `${e.type}${e.value ? `: ${e.value}` : ""}${e.notes ? ` — ${e.notes}` : ""}`, date: e.occurred_at }))),
      ...(((med7.data as any[]) ?? []).slice(0, 12).map((m) => ({ type: "Medicação", detail: `Status: ${m.status}${m.notes ? ` — ${m.notes}` : ""}`, date: m.taken_at }))),
      ...(((vitals7.data as any[]) ?? []).slice(0, 12).map((v) => ({ type: "Sinais", detail: [v.systolic && v.diastolic ? `PA ${v.systolic}/${v.diastolic}` : "", v.glucose ? `Glicemia ${v.glucose}` : "", v.temperature ? `Temp. ${v.temperature}` : "", v.oxygen_saturation ? `Sat. ${v.oxygen_saturation}%` : "", v.pain_level ? `Dor ${v.pain_level}/10` : ""].filter(Boolean).join(" • ") || "Sinal registrado", date: v.measured_at }))),
    ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 15);
    setRecent(rows);
    setLoading(false);
  }

  const maxDayValue = useMemo(() => Math.max(1, ...days.map((d) => d.events + d.meds + d.routines + d.vitals + d.usage)), [days]);

  function exportCSV() {
    const header = ["data", "uso", "medicacoes", "rotinas", "eventos", "sinais_vitais"];
    const lines = [header.join(",")];
    days.forEach((d) => lines.push([d.date, d.usage, d.meds, d.routines, d.events, d.vitals].map(csvEscape).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-vozia-cuidador-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    trackUsage("report_generated", "gestao", null, { type: "csv" });
    toast.success("Relatório CSV gerado");
  }

  function printReport() {
    trackUsage("report_generated", "gestao", null, { type: "print" });
    window.print();
  }

  if (profile?.role !== "familiar_admin") {
    return (
      <Alert className="border-warning/50 bg-warning/5">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Acesso restrito</AlertTitle>
        <AlertDescription>Esta área é apenas para o administrador da conta. Cuidadores e pacientes não devem acessar dados de gestão.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> Gestão e decisão
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold">Gestão da plataforma</h1>
          <p className="text-sm text-muted-foreground">Indicadores de uso, cadastros, eventos e engajamento para tomada de decisão.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printReport}><FileText className="h-4 w-4" /> PDF/Imprimir</Button>
          <Button onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
        </div>
      </div>

      <Alert className="border-primary/30 bg-primary-soft/60">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Importante para versão online</AlertTitle>
        <AlertDescription>
          Com RLS ativo, esta tela mostra os dados que o usuário logado tem permissão para acessar. Para gestão nacional da Vozia, crie depois um perfil <strong>super_admin</strong> no Supabase.
        </AlertDescription>
      </Alert>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={UserRound} label="Pacientes" value={totals.patients} />
        <Metric icon={Users} label="Usuários" value={totals.users} />
        <Metric icon={Pill} label="Medicações cadastradas" value={totals.meds} />
        <Metric icon={Activity} label="Usos hoje" value={totals.usageToday} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={ClipboardCheck} label="Rotinas" value={totals.routines} />
        <Metric icon={CalendarDays} label="Eventos" value={totals.events} />
        <Metric icon={Activity} label="Sinais vitais" value={totals.vitals} />
      </div>

      <Card className="p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Uso nos últimos 7 dias</h2>
            <p className="text-xs text-muted-foreground">Soma de acessos, medicações, rotinas, eventos e sinais vitais.</p>
          </div>
          {loading && <Badge variant="secondary">Carregando…</Badge>}
        </div>
        <div className="grid grid-cols-7 items-end gap-2">
          {days.map((d) => {
            const total = d.events + d.meds + d.routines + d.vitals + d.usage;
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-xl bg-secondary p-1">
                  <div className="w-full rounded-lg gradient-medical" style={{ height: `${Math.max(8, (total / maxDayValue) * 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{formatDateBR(d.date)}</p>
                <p className="font-display text-sm font-bold">{total}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold">Eventos recentes para decisão</h2>
        <p className="mb-4 text-xs text-muted-foreground">Ajuda a entender uso real, problemas frequentes e valor clínico da plataforma.</p>
        <div className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum registro recente.</p>
          ) : recent.map((r, idx) => (
            <div key={`${r.date}-${idx}`} className="flex items-start justify-between gap-3 rounded-xl bg-secondary p-3">
              <div>
                <Badge variant="outline">{r.type}</Badge>
                <p className="mt-1 text-sm">{r.detail}</p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">{new Date(r.date).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: any) {
  return (
    <Card className="p-4 shadow-card">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
