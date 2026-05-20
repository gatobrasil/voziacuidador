import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/painel/pacientes")({
  component: PatientsRoute,
});

function PatientsRoute() {
  const location = useRouterState({ select: (s) => s.location.pathname });

  if (location !== "/painel/pacientes") {
    return <Outlet />;
  }

  return <PatientsList />;
}

function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("patients").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setPatients(data ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/painel" className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
          <h1 className="mt-1 font-display text-2xl font-bold">Pacientes</h1>
        </div>
        <Button asChild><Link to="/painel/pacientes/novo"><Plus className="h-4 w-4" /> Novo</Link></Button>
      </div>
      <div className="space-y-2">
        {patients.map((p) => (
          <Link key={p.id} to="/painel/paciente/$id" params={{ id: p.id }}>
            <Card className="flex items-center justify-between p-4 shadow-card hover:bg-secondary">
              <div>
                <p className="font-display font-semibold">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">{p.age ? `${p.age} anos` : ""}{p.diagnosis ? ` • ${p.diagnosis}` : ""}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Card>
          </Link>
        ))}
        {patients.length === 0 && <p className="text-sm text-muted-foreground">Nenhum paciente.</p>}
      </div>
    </div>
  );
}
