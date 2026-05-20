import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, Users, Home, Bell, BarChart3, ShieldAlert } from "lucide-react";
import { startMedicationAlerts, stopMedicationAlerts, requestNotificationPermission } from "@/lib/med-alerts";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trackUsage } from "@/lib/usage-tracker";

export const Route = createFileRoute("/painel")({
  component: PainelLayout,
});

function PainelLayout() {
  const { user, loading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location.pathname });
  const [acceptedProtection, setAcceptedProtection] = useState(() => typeof window !== "undefined" && localStorage.getItem("vozia-protection-accepted") === "yes");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    startMedicationAlerts();
    trackUsage("page_view", location.replace("/painel", "painel") || "painel");
    return () => stopMedicationAlerts();
  }, [user]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const enableAlerts = async () => {
    const ok = await requestNotificationPermission();
    toast[ok ? "success" : "error"](ok ? "Alertas ativados" : "Permissão negada pelo navegador");
  };

  const roleLabel = profile?.role === "familiar_admin" ? "Familiar admin." : profile?.role === "cuidador" ? "Cuidador" : "Paciente";

  const acceptProtection = () => {
    localStorage.setItem("vozia-protection-accepted", "yes");
    setAcceptedProtection(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/painel" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-medical text-white">
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold">Vozia Cuidador</p>
              <p className="text-[11px] text-muted-foreground">{profile?.full_name} • {roleLabel}</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            {profile?.role === "familiar_admin" && (
              <Button asChild variant="ghost" size="sm" title="Gestão da plataforma">
                <Link to="/painel/gestao">
                  <BarChart3 className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Gestão</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" title="Proteção e aviso de uso">
              <Link to="/protecao">
                <ShieldAlert className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Proteção</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={enableAlerts} title="Ativar alertas de medicação">
              <Bell className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Alertas</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
        <div className="mx-auto flex max-w-6xl">
          <Link to="/painel" className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${location === "/painel" ? "text-primary" : "text-muted-foreground"}`}>
            <Home className="h-5 w-5" /> Início
          </Link>
          <Link to="/painel/pacientes" className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${location.startsWith("/painel/pacientes") || location.includes("/paciente/") ? "text-primary" : "text-muted-foreground"}`}>
            <Users className="h-5 w-5" /> Pacientes
          </Link>
          {profile?.role === "familiar_admin" && (
            <Link to="/painel/gestao" className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${location === "/painel/gestao" ? "text-primary" : "text-muted-foreground"}`}>
              <BarChart3 className="h-5 w-5" /> Gestão
            </Link>
          )}
        </div>
      </nav>

      <AlertDialog open={!acceptedProtection}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aviso importante de uso</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 leading-6">
              <span className="block">O Vozia Cuidador é uma ferramenta de apoio à organização do cuidado, comunicação e registro de informações.</span>
              <span className="block">Ele não substitui avaliação médica, diagnóstico, prescrição, acompanhamento profissional ou atendimento de urgência/emergência.</span>
              <span className="block">Em caso de piora clínica, sintomas graves ou dúvida sobre conduta, consulte um médico ou serviço de saúde.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={acceptProtection}>Entendi e concordo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
