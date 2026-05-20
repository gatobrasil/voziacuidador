import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Heart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/protecao")({
  component: ProtecaoPage,
});

function ProtecaoPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-medical text-white">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Vozia Cuidador</span>
          </Link>
          <Button asChild variant="outline" size="sm"><Link to="/login">Entrar</Link></Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Proteção, responsabilidade e uso adequado
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Termo de uso e aviso importante</h1>
          <p className="mt-2 text-muted-foreground">Esta página deve ficar disponível antes do login e também dentro da plataforma.</p>
        </div>

        <Card className="border-warning/50 bg-warning/5 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-warning" />
            <div>
              <h2 className="font-display text-xl font-bold">O Vozia Cuidador é uma ferramenta de apoio</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O Vozia Cuidador auxilia na organização de rotina, medicações, comunicação e registro de eventos. A plataforma não substitui avaliação médica, consulta, diagnóstico, prescrição, acompanhamento profissional ou serviço de urgência/emergência.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold">Responsabilidade clínica</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Medicamentos, doses, horários, condutas e mudanças no plano de cuidado devem ser sempre definidos e revisados por médico ou profissional habilitado. Em caso de dúvida, piora clínica ou evento grave, procure atendimento médico.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold">Emergências</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Em situações como falta de ar, dor intensa, queda com trauma, alteração importante de consciência, sinais de AVC, dor no peito ou qualquer emergência, acione o serviço de emergência local imediatamente.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold">Dados cadastrados</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              As informações inseridas dependem da qualidade dos dados fornecidos pelo familiar, cuidador ou responsável. Registros incorretos podem comprometer o acompanhamento.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold">Uso recomendado</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use a plataforma como apoio à comunicação e organização do cuidado domiciliar, mantendo acompanhamento profissional regular e validação médica das informações essenciais.
            </p>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold">Texto curto para aceite</h3>
          <p className="mt-2 rounded-xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
            Declaro que entendo que o Vozia Cuidador é uma ferramenta de apoio à organização do cuidado e comunicação, não substituindo avaliação médica, diagnóstico, prescrição, acompanhamento profissional ou atendimento de urgência/emergência.
          </p>
        </Card>
      </main>
    </div>
  );
}
