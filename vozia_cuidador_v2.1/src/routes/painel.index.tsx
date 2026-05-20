import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Activity, Pill, ClipboardCheck } from "lucide-react";
import { seedDemoData } from "@/lib/seed-demo";

export const Route = createFileRoute("/painel/")({
  component: Dashboard,
});

interface PatientRow {
  id: string;
  full_name: string;
  age: number | null;
  diagnosis: string | null;
}

function Dashboard() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [stats, setStats] = useState({ meds: 0, routines: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("patients").select("id, full_name, age, diagnosis").order("created_at", { ascending: false });
      setPatients((data as PatientRow[]) ?? []);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const ids = (data ?? []).map((p: any) => p.id);
      if (ids.length) {
        const [m, r, e] = await Promise.all([
          supabase.from("medication_logs").select("id", { count: "exact", head: true }).gte("taken_at", today.toISOString()).in("patient_id", ids),
          supabase.from("routine_logs").select("id", { count: "exact", head: true }).gte("completed_at", today.toISOString()).in("patient_id", ids),
          supabase.from("events").select("id", { count: "exact", head: true }).gte("occurred_at", today.toISOString()).in("patient_id", ids),
        ]);
        setStats({ meds: m.count ?? 0, routines: r.count ?? 0, events: e.count ?? 0 });
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Olá, {profile?.full_name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Resumo do dia — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Pill} label="Medicações" value={stats.meds} tint="text-primary" />
        <StatCard icon={ClipboardCheck} label="Rotinas" value={stats.routines} tint="text-success" />
        <StatCard icon={Activity} label="Eventos" value={stats.events} tint="text-warning" />
      </div>

      {profile?.role !== "familiar_admin" && (
        <Card className="border-warning/40 bg-warning/5 p-4">
          <p className="text-sm">
            Esta conta está como <strong>{profile?.role === "cuidador" ? "Cuidador" : "Paciente"}</strong>. Para segurança, o papel do usuário não pode ser alterado por botão dentro do app.
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Pacientes</h2>
        <Button asChild size="sm"><Link to="/painel/pacientes/novo"><Plus className="h-4 w-4" /> Novo paciente</Link></Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : patients.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado ainda.</p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Button asChild><Link to="/painel/pacientes/novo">Cadastrar paciente</Link></Button>
            <Button variant="outline" onClick={async () => { await seedDemoData(); window.location.reload(); }}>Carregar dados de exemplo</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <Link key={p.id} to="/painel/paciente/$id" params={{ id: p.id }}>
              <Card className="flex items-center justify-between p-4 shadow-card transition hover:bg-secondary">
                <div>
                  <p className="font-display font-semibold">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.age ? `${p.age} anos` : ""}{p.diagnosis ? ` • ${p.diagnosis}` : ""}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: any) {
  return (
    <Card className="p-4 shadow-card">
      <Icon className={`h-5 w-5 ${tint}`} />
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
