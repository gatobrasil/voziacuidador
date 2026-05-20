import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Activity, Users, ClipboardList, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/painel" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-medical text-white">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Vozia Cuidador</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/protecao">
              <Button variant="ghost" size="sm">Proteção</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Plataforma clínica segura
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Cuidado humano,<br /><span className="text-primary">gestão simples.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              Conectamos familiares, cuidadores e pacientes em uma plataforma única
              para acompanhar medicações, rotinas, eventos clínicos e comunicação diária.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="h-12 px-6 text-base">Começar agora</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Activity, label: "Sinais vitais", color: "text-primary" },
                { icon: ClipboardList, label: "Medicações", color: "text-success" },
                { icon: Users, label: "Equipe de cuidado", color: "text-primary" },
                { icon: MessageCircle, label: "Comunicação", color: "text-warning" },
              ].map((f) => (
                <div key={f.label} className="rounded-2xl bg-secondary p-4">
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                  <p className="mt-3 font-display text-sm font-semibold text-foreground">{f.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl gradient-medical p-5 text-white">
              <p className="text-sm opacity-90">Hoje</p>
              <p className="mt-1 font-display text-2xl font-bold">8 cuidados realizados</p>
              <p className="mt-1 text-sm opacity-90">2 medicações pendentes • 0 ocorrências</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Vozia Cuidador • Ferramenta de apoio, não substitui avaliação médica.
      </footer>
    </div>
  );
}
