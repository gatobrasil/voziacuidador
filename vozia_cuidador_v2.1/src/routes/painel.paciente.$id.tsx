import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Pill, ClipboardCheck, Activity, MessageCircle, Plus, Check, Clock, X, FileText, Volume2, HeartPulse, Stethoscope, Edit, Link2, Copy, BellRing, ShieldCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/painel/paciente/$id")({
  component: PatientDetail,
});

const ROUTINE_LABELS: Record<string, string> = {
  banho: "Banho", alimentacao: "Alimentação", hidratacao: "Hidratação",
  fisioterapia: "Fisioterapia", caminhada: "Caminhada", sono: "Sono", troca_posicao: "Troca de posição",
};
const EVENT_LABELS: Record<string, string> = {
  dor: "Dor", febre: "Febre", pressao: "Pressão", glicemia: "Glicemia", queda: "Queda",
  agitacao: "Agitação", alimentacao: "Alimentação", evacuacao: "Evacuação", sono: "Sono", observacao: "Observação",
};

function confirmAction(message = "Deseja confirmar esta mudança?") {
  return window.confirm(message);
}

function PatientDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [meds, setMeds] = useState<any[]>([]);
  const [medLogs, setMedLogs] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [routineLogs, setRoutineLogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);

  const load = useCallback(async () => {
    const [p, m, ml, r, rl, e, qm, v] = await Promise.all([
      supabase.from("patients").select("*").eq("id", id).single(),
      supabase.from("medications").select("*").eq("patient_id", id).eq("active", true).order("schedule_time"),
      supabase.from("medication_logs").select("*").eq("patient_id", id).order("taken_at", { ascending: false }).limit(50),
      supabase.from("routines").select("*").eq("patient_id", id).order("schedule_time"),
      supabase.from("routine_logs").select("*").eq("patient_id", id).order("completed_at", { ascending: false }).limit(50),
      supabase.from("events").select("*").eq("patient_id", id).order("occurred_at", { ascending: false }).limit(50),
      supabase.from("quick_messages").select("*").eq("patient_id", id).order("created_at", { ascending: false }).limit(30),
      supabase.from("vitals").select("*").eq("patient_id", id).order("measured_at", { ascending: false }).limit(60),
    ]);
    setPatient(p.data); setMeds(m.data ?? []); setMedLogs(ml.data ?? []);
    setRoutines(r.data ?? []); setRoutineLogs(rl.data ?? []);
    setEvents(e.data ?? []); setMessages(qm.data ?? []); setVitals(v.data ?? []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!patient) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const medsToday = medLogs.filter((l) => new Date(l.taken_at) >= today);
  const routinesToday = routineLogs.filter((l) => new Date(l.completed_at) >= today);
  const eventsToday = events.filter((l) => new Date(l.occurred_at) >= today);

  const caregiverMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("modo") === "cuidador";
  if (caregiverMode) {
    return (
      <CaregiverOnlyView
        patient={patient}
        patientId={id}
        userId={user!.id}
        meds={meds}
        medLogs={medLogs}
        routines={routines}
        routineLogs={routineLogs}
        events={events}
        messages={messages}
        vitals={vitals}
        reload={load}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/painel" className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Painel</Link>

      <Card className="p-5 shadow-card">
        <div className="flex items-start gap-4">
          <PatientAvatar path={patient.photo_url} name={patient.full_name} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{patient.full_name}</h1>
            <p className="text-sm text-muted-foreground">
              {patient.birth_date ? `${new Date(patient.birth_date).toLocaleDateString("pt-BR")}` : patient.age ? `${patient.age} anos` : ""}
              {patient.diagnosis ? ` • ${patient.diagnosis}` : ""}
            </p>
            {patient.updated_at && (
              <p className="mt-1 text-xs text-muted-foreground">
                Última atualização: {new Date(patient.updated_at).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {patient.chronic_conditions && <Info label="Doenças de base" value={patient.chronic_conditions} />}
          {patient.continuous_medications && <Info label="Medicações contínuas" value={patient.continuous_medications} />}
          {patient.allergies && <Info label="Alergias" value={patient.allergies} />}
          {patient.emergency_contact && <Info label="Emergência" value={patient.emergency_contact} />}
          {patient.doctor_name && <Info label="Médico" value={patient.doctor_name} />}
          {patient.notes && <Info label="Observações" value={patient.notes} />}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <EditPatientDialog patient={patient} reload={load} />
          <CaregiverLinkButton patientId={id} />
          <Badge variant="secondary">{medsToday.length} medicações hoje</Badge>
          <Badge variant="secondary">{routinesToday.length} rotinas hoje</Badge>
          <Badge variant="secondary">{eventsToday.length} eventos hoje</Badge>
        </div>
      </Card>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="vitals"><HeartPulse className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Sinais</span></TabsTrigger>
          <TabsTrigger value="meds"><Pill className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Medicações</span></TabsTrigger>
          <TabsTrigger value="routines"><ClipboardCheck className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Rotina</span></TabsTrigger>
          <TabsTrigger value="events"><Activity className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Eventos</span></TabsTrigger>
          <TabsTrigger value="comm"><MessageCircle className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Comunicação</span></TabsTrigger>
          <TabsTrigger value="anamnese"><Stethoscope className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Anamnese</span></TabsTrigger>
          <TabsTrigger value="report"><FileText className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Relatório</span></TabsTrigger>
        </TabsList>

        <TabsContent value="vitals"><VitalsTab patientId={id} userId={user!.id} vitals={vitals} reload={load} /></TabsContent>
        <TabsContent value="meds"><MedicationsTab patientId={id} userId={user!.id} meds={meds} logs={medLogs} reload={load} /></TabsContent>
        <TabsContent value="routines"><RoutinesTab patientId={id} userId={user!.id} routines={routines} logs={routineLogs} reload={load} /></TabsContent>
        <TabsContent value="events"><EventsTab patientId={id} userId={user!.id} events={events} reload={load} /></TabsContent>
        <TabsContent value="comm"><CommunicationTab patientId={id} userId={user!.id} messages={messages} reload={load} /></TabsContent>
        <TabsContent value="anamnese"><AnamneseTab patient={patient} meds={meds} medLogs={medLogs} routines={routines} routineLogs={routineLogs} events={events} vitals={vitals} reload={load} /></TabsContent>
        <TabsContent value="report"><ReportTab patient={patient} medsToday={medsToday} routinesToday={routinesToday} eventsToday={eventsToday} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function PatientAvatar({ path, name }: { path: string | null; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    supabase.storage.from("patient-photos").createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path]);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-secondary ring-2 ring-border">
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-muted-foreground">
          {initials || "?"}
        </div>
      )}
    </div>
  );
}

/* MEDICATIONS */
const INTERVAL_OPTIONS = [
  { value: "24", label: "24 em 24 horas", times: 1 },
  { value: "12", label: "12 em 12 horas", times: 2 },
  { value: "8", label: "8 em 8 horas", times: 3 },
  { value: "6", label: "6 em 6 horas", times: 4 },
];

function addHoursToTime(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + hours * 60) % (24 * 60);
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function getMedicationTimes(m: any) {
  const raw = m.notes?.match(/HORARIOS:([^|]+)/)?.[1]?.trim();
  if (raw) return raw.split(",").map((x: string) => x.trim()).filter(Boolean);
  return m.schedule_time ? [m.schedule_time.slice(0, 5)] : [];
}

function isMedicationDueNow(m: any, logs: any[]) {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const times = getMedicationTimes(m);
  const todayKey = now.toISOString().slice(0, 10);
  return times.some((t: string) => {
    const [h, min] = t.split(":").map(Number);
    const target = h * 60 + min;
    const near = Math.abs(minutesNow - target) <= 5;
    const alreadyLogged = logs.some((l: any) => l.medication_id === m.id && l.status === "administrado" && new Date(l.taken_at).toISOString().slice(0, 10) === todayKey);
    return near && !alreadyLogged;
  });
}

function MedicationAlarmBanner({ meds, logs }: { meds: any[]; logs: any[] }) {
  const due = meds.filter((m) => isMedicationDueNow(m, logs));
  useEffect(() => {
    if (due.length === 0) return;
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");
      audio.play().catch(() => {});
    } catch {}
  }, [due.length]);
  if (due.length === 0) return null;
  return (
    <Card className="border-destructive bg-destructive/10 p-4 shadow-card">
      <div className="flex items-start gap-3">
        <BellRing className="mt-1 h-5 w-5 text-destructive" />
        <div>
          <p className="font-display font-bold text-destructive">Alerta de medicação agora</p>
          <p className="text-sm text-muted-foreground">Confira e registre se a medicação foi administrada, adiada ou não administrada.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {due.map((m) => <Badge key={m.id} variant="destructive">{m.name} {m.dose ? `• ${m.dose}` : ""}</Badge>)}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MedicationsTab({ patientId, userId, meds, logs, reload }: any) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: "", dose: "", use_type: "continuo", schedule_mode: "intervalo", interval_hours: "24",
    first_time: "08:00", fixed_1: "08:00", fixed_2: "20:00", fixed_3: "", fixed_4: "",
    duration: "", notes: ""
  });

  const selectedTimes = (() => {
    if (f.schedule_mode === "intervalo") {
      const opt = INTERVAL_OPTIONS.find((o) => o.value === f.interval_hours) ?? INTERVAL_OPTIONS[0];
      return Array.from({ length: opt.times }, (_, i) => addHoursToTime(f.first_time, i * Number(f.interval_hours)));
    }
    return [f.fixed_1, f.fixed_2, f.fixed_3, f.fixed_4].filter(Boolean);
  })();

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTimes.length === 0) return toast.error("Selecione pelo menos um horário");
    if (!confirmAction(`Deseja salvar ${f.name} com alerta em: ${selectedTimes.join(", ")}?`)) return;
    const notes = [`TIPO:${f.use_type}`, `HORARIOS:${selectedTimes.join(",")}`, f.notes ? `OBS:${f.notes}` : ""].filter(Boolean).join(" | ");
    const { error } = await supabase.from("medications").insert({
      patient_id: patientId, name: f.name, dose: f.dose || null, owner_id: userId, recorded_by: userId, active: true,
      schedule_time: selectedTimes[0] || null,
      frequency: f.schedule_mode === "intervalo" ? `${f.interval_hours}/${f.interval_hours}h` : `${selectedTimes.length} horário(s) fixo(s)`,
      duration: f.use_type === "continuo" ? "Uso contínuo" : (f.duration || null), notes,
    } as any);
    if (error) return toast.error(error.message);
    setOpen(false);
    setF({ name: "", dose: "", use_type: "continuo", schedule_mode: "intervalo", interval_hours: "24", first_time: "08:00", fixed_1: "08:00", fixed_2: "20:00", fixed_3: "", fixed_4: "", duration: "", notes: "" });
    toast.success("Medicação adicionada com alerta"); reload();
  };

  const logStatus = async (medId: string, status: "administrado" | "adiado" | "nao_administrado") => {
    if (!confirmAction(`Confirmar medicação como ${statusLabel(status).toLowerCase()}?`)) return;
    const { error } = await supabase.from("medication_logs").insert({ medication_id: medId, patient_id: patientId, status, taken_by: userId, recorded_by: userId, taken_at: new Date().toISOString() } as any);
    if (error) return toast.error(error.message);
    toast.success("Registrado"); reload();
  };

  return (
    <div className="space-y-3">
      <MedicationAlarmBanner meds={meds} logs={logs} />
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Nova medicação</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>Nova medicação com alerta</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nome *</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="ex: Losartana" /></div>
                <div><Label>Dose</Label><Input value={f.dose} onChange={(e) => setF({ ...f, dose: e.target.value })} placeholder="ex: 50 mg" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo de uso</Label>
                  <Select value={f.use_type} onValueChange={(v) => setF({ ...f, use_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continuo">Uso contínuo</SelectItem>
                      <SelectItem value="temporario">Uso por período</SelectItem>
                      <SelectItem value="se_necessario">Se necessário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Como definir horários?</Label>
                  <Select value={f.schedule_mode} onValueChange={(v) => setF({ ...f, schedule_mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intervalo">Por intervalo</SelectItem>
                      <SelectItem value="fixos">Horários fixos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {f.schedule_mode === "intervalo" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Frequência</Label>
                    <Select value={f.interval_hours} onValueChange={(v) => setF({ ...f, interval_hours: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INTERVAL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Primeiro horário</Label><Input type="time" value={f.first_time} onChange={(e) => setF({ ...f, first_time: e.target.value })} /></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div><Label>Horário 1</Label><Input type="time" value={f.fixed_1} onChange={(e) => setF({ ...f, fixed_1: e.target.value })} /></div>
                  <div><Label>Horário 2</Label><Input type="time" value={f.fixed_2} onChange={(e) => setF({ ...f, fixed_2: e.target.value })} /></div>
                  <div><Label>Horário 3</Label><Input type="time" value={f.fixed_3} onChange={(e) => setF({ ...f, fixed_3: e.target.value })} /></div>
                  <div><Label>Horário 4</Label><Input type="time" value={f.fixed_4} onChange={(e) => setF({ ...f, fixed_4: e.target.value })} /></div>
                </div>
              )}

              <Card className="bg-primary/5 p-3 text-sm">
                <strong>Alertas que serão criados:</strong> {selectedTimes.join(", ") || "nenhum horário selecionado"}
              </Card>

              {f.use_type === "temporario" && <div><Label>Duração</Label><Input value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} placeholder="ex: 7 dias" /></div>}
              <div><Label>Observações</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="ex: após alimentação, não partir comprimido..." /></div>
              <Button type="submit" className="w-full">Salvar medicação e alertas</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {meds.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Nenhuma medicação ativa.</Card> :
        meds.map((m: any) => {
          const due = isMedicationDueNow(m, logs);
          const times = getMedicationTimes(m);
          return (
            <Card key={m.id} className={`p-4 shadow-card ${due ? "border-destructive bg-destructive/5" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{[m.dose, m.duration, m.frequency].filter(Boolean).join(" • ")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {times.map((t: string) => <Badge key={t} variant={due ? "destructive" : "secondary"}>🔔 {t}</Badge>)}
                  </div>
                  {m.notes && <p className="mt-2 text-xs text-muted-foreground">{String(m.notes).replace(/TIPO:[^|]+\|?/, "").replace(/HORARIOS:[^|]+\|?/, "").replace("OBS:", "")}</p>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button size="sm" variant="default" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => logStatus(m.id, "administrado")}><Check className="h-4 w-4" /> Dado</Button>
                <Button size="sm" variant="outline" onClick={() => logStatus(m.id, "adiado")}><Clock className="h-4 w-4" /> Adiar</Button>
                <Button size="sm" variant="outline" className="border-destructive/40 text-destructive" onClick={() => logStatus(m.id, "nao_administrado")}><X className="h-4 w-4" /> Não deu</Button>
              </div>
            </Card>
          );
        })}

      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 font-display text-sm font-semibold">Histórico recente</h3>
          <div className="space-y-1">
            {logs.slice(0, 8).map((l: any) => {
              const med = meds.find((m: any) => m.id === l.medication_id);
              return (
                <div key={l.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs">
                  <span>{med?.name ?? "—"} • <span className="text-muted-foreground">{statusLabel(l.status)}</span></span>
                  <span className="text-muted-foreground">{new Date(l.taken_at).toLocaleString("pt-BR")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function statusLabel(s: string) {
  return s === "administrado" ? "Administrado" : s === "adiado" ? "Adiado" : "Não administrado";
}

function CaregiverLinkButton({ patientId }: { patientId: string }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/painel/paciente/${patientId}?modo=cuidador` : "";
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Link do cuidador copiado");
  };
  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <Link2 className="h-4 w-4" /> Copiar link do cuidador
    </Button>
  );
}

function CaregiverOnlyView({ patient, patientId, userId, meds, medLogs, routines, routineLogs, events, messages, vitals, reload }: any) {
  return (
    <div className="space-y-5">
      <Card className="border-primary/30 bg-primary/5 p-5 shadow-card">
        <div className="flex items-start gap-4">
          <PatientAvatar path={patient.photo_url} name={patient.full_name} />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge><ShieldCheck className="mr-1 h-3 w-3" /> Modo cuidador</Badge>
              <Badge variant="secondary">Acesso restrito</Badge>
            </div>
            <h1 className="font-display text-2xl font-bold">{patient.full_name}</h1>
            <p className="text-sm text-muted-foreground">O cuidador pode registrar sinais, medicações, rotina e eventos. Não pode alterar cadastro clínico nem criar medicação.</p>
          </div>
        </div>
      </Card>

      <MedicationAlarmBanner meds={meds} logs={medLogs} />

      <Tabs defaultValue="meds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="meds"><Pill className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Medicação</span></TabsTrigger>
          <TabsTrigger value="routines"><ClipboardCheck className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Rotina</span></TabsTrigger>
          <TabsTrigger value="vitals"><HeartPulse className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Sinais</span></TabsTrigger>
          <TabsTrigger value="events"><Activity className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Eventos</span></TabsTrigger>
          <TabsTrigger value="comm"><MessageCircle className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Falar</span></TabsTrigger>
        </TabsList>
        <TabsContent value="meds"><CaregiverMedsTab patientId={patientId} userId={userId} meds={meds} logs={medLogs} reload={reload} /></TabsContent>
        <TabsContent value="routines"><RoutinesTab patientId={patientId} userId={userId} routines={routines} logs={routineLogs} reload={reload} /></TabsContent>
        <TabsContent value="vitals"><VitalsTab patientId={patientId} userId={userId} vitals={vitals} reload={reload} /></TabsContent>
        <TabsContent value="events"><EventsTab patientId={patientId} userId={userId} events={events} reload={reload} /></TabsContent>
        <TabsContent value="comm"><CommunicationTab patientId={patientId} userId={userId} messages={messages} reload={reload} /></TabsContent>
      </Tabs>
    </div>
  );
}

function CaregiverMedsTab({ patientId, userId, meds, logs, reload }: any) {
  const logStatus = async (medId: string, status: "administrado" | "adiado" | "nao_administrado") => {
    if (!confirmAction(`Confirmar medicação como ${statusLabel(status).toLowerCase()}?`)) return;
    const { error } = await supabase.from("medication_logs").insert({ medication_id: medId, patient_id: patientId, status, taken_by: userId, recorded_by: userId, taken_at: new Date().toISOString() } as any);
    if (error) return toast.error(error.message);
    toast.success("Registrado"); reload();
  };
  return (
    <div className="space-y-3">
      {meds.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Nenhuma medicação cadastrada pelo familiar.</Card> : meds.map((m: any) => {
        const times = getMedicationTimes(m);
        const due = isMedicationDueNow(m, logs);
        return (
          <Card key={m.id} className={`p-4 shadow-card ${due ? "border-destructive bg-destructive/5" : ""}`}>
            <p className="font-display font-semibold">{m.name}</p>
            <p className="text-xs text-muted-foreground">{[m.dose, m.duration, m.frequency].filter(Boolean).join(" • ")}</p>
            <div className="mt-2 flex flex-wrap gap-2">{times.map((t: string) => <Badge key={t} variant={due ? "destructive" : "secondary"}>🔔 {t}</Badge>)}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => logStatus(m.id, "administrado")}><Check className="h-4 w-4" /> Dado</Button>
              <Button size="sm" variant="outline" onClick={() => logStatus(m.id, "adiado")}><Clock className="h-4 w-4" /> Adiar</Button>
              <Button size="sm" variant="outline" className="border-destructive/40 text-destructive" onClick={() => logStatus(m.id, "nao_administrado")}><X className="h-4 w-4" /> Não deu</Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ROUTINES */
function RoutinesTab({ patientId, userId, routines, logs, reload }: any) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: "banho", schedule_time: "", notes: "" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAction("Deseja salvar esta rotina no plano diário do paciente?")) return;
    const { error } = await supabase.from("routines").insert({
      patient_id: patientId, type: f.type as any, schedule_time: f.schedule_time || null, notes: f.notes || null, owner_id: userId, active: true,
    } as any);
    if (error) return toast.error(error.message);
    setOpen(false); setF({ type: "banho", schedule_time: "", notes: "" });
    toast.success("Rotina adicionada"); reload();
  };

  const check = async (routineId: string) => {
    if (!confirmAction("Confirmar que esta rotina foi realizada?")) return;
    const { error } = await supabase.from("routine_logs").insert({
      routine_id: routineId, patient_id: patientId, completed_by: userId, recorded_by: userId, completed_at: new Date().toISOString(),
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Concluído"); reload();
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const doneTodayIds = new Set(logs.filter((l: any) => new Date(l.completed_at) >= today).map((l: any) => l.routine_id));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Nova rotina</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova rotina</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROUTINE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Horário</Label><Input type="time" value={f.schedule_time} onChange={(e) => setF({ ...f, schedule_time: e.target.value })} /></div>
              <div><Label>Observações</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {routines.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Sem rotinas cadastradas.</Card> :
        routines.map((r: any) => {
          const done = doneTodayIds.has(r.id);
          return (
            <Card key={r.id} className={`flex items-center justify-between p-4 shadow-card ${done ? "bg-success/5" : ""}`}>
              <div>
                <p className="font-display font-semibold">{ROUTINE_LABELS[r.type]}</p>
                <p className="text-xs text-muted-foreground">{r.schedule_time ? `às ${r.schedule_time.slice(0, 5)}` : "Sem horário fixo"}{r.notes ? ` • ${r.notes}` : ""}</p>
              </div>
              <Button size="sm" variant={done ? "outline" : "default"} onClick={() => check(r.id)} disabled={done}>
                {done ? <><Check className="h-4 w-4" /> Feito</> : "Concluir"}
              </Button>
            </Card>
          );
        })}
    </div>
  );
}

/* EVENTS */
function EventsTab({ patientId, userId, events, reload }: any) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: "dor", value: "", notes: "" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAction("Deseja registrar este evento no histórico do paciente?")) return;
    const { error } = await supabase.from("events").insert({
      patient_id: patientId, type: f.type as any, value: f.value || null, notes: f.notes || null, recorded_by: userId, occurred_at: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    setOpen(false); setF({ type: "dor", value: "", notes: "" });
    toast.success("Evento registrado"); reload();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Registrar evento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo evento</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor / medida</Label><Input value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="ex: 12/8, 37.8°C, intensa" /></div>
              <div><Label>Observações</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <h3 className="font-display text-sm font-semibold">Timeline</h3>
      {events.length === 0 ? <Card className="p-6 text-center text-sm text-muted-foreground">Nenhum evento registrado.</Card> :
        <div className="relative space-y-3 border-l-2 border-border pl-5">
          {events.map((e: any) => (
            <div key={e.id} className="relative">
              <div className="absolute -left-[27px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold">{EVENT_LABELS[e.type] ?? e.type}{e.value && <span className="ml-2 font-normal text-primary">{e.value}</span>}</p>
                  <span className="text-xs text-muted-foreground">{new Date(e.occurred_at).toLocaleString("pt-BR")}</span>
                </div>
                {e.notes && <p className="mt-1 text-xs text-muted-foreground">{e.notes}</p>}
              </Card>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

/* COMMUNICATION */
const QUICK_PHRASES = [
  "Estou com dor", "Preciso de água", "Estou com fome", "Preciso ir ao banheiro",
  "Estou com frio", "Estou com calor", "Quero descansar", "Chame o cuidador",
];

function CommunicationTab({ patientId, userId, messages, reload }: any) {
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR"; u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const send = async (message: string) => {
    if (!confirmAction(`Registrar e falar: "${message}"?`)) return;
    speak(message);
    const { error } = await supabase.from("quick_messages").insert({
      patient_id: patientId, message, sent_by: userId, created_at: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success("Mensagem enviada"); reload();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Toque em uma mensagem para falar em voz alta e registrar.</p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_PHRASES.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="flex min-h-[88px] items-center justify-center gap-2 rounded-2xl bg-primary p-4 text-center font-display text-base font-semibold text-primary-foreground shadow-card transition active:scale-95"
          >
            <Volume2 className="h-5 w-5 shrink-0" />
            {p}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div>
          <h3 className="mb-2 mt-4 font-display text-sm font-semibold">Histórico</h3>
          <div className="space-y-1">
            {messages.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                <span>{m.message}</span>
                <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


/* ANAMNESE MÉDICA */
function AnamneseTab({ patient, meds, medLogs, routines, routineLogs, events, vitals, reload }: any) {
  const lastVitals = vitals[0];
  const lastEvents = events.slice(0, 10);
  const lastMeds = medLogs.slice(0, 10);

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Resumo para anamnese médica</h3>
            <p className="text-sm text-muted-foreground">Tela feita para o médico entender rapidamente histórico, medicações, sinais e eventos antes da consulta.</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}><FileText className="h-4 w-4" /> Imprimir</Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="Identificação" value={`${patient.full_name}${patient.age ? `, ${patient.age} anos` : ""}${patient.birth_date ? ` • nasc. ${new Date(patient.birth_date).toLocaleDateString("pt-BR")}` : ""}`} />
          <Info label="Diagnóstico principal" value={patient.diagnosis || "Não informado"} />
          <Info label="Doenças de base" value={patient.chronic_conditions || "Não informado"} />
          <Info label="Alergias" value={patient.allergies || "Não informado"} />
          <Info label="Medicações contínuas cadastradas" value={patient.continuous_medications || "Ver lista de medicações abaixo"} />
          <Info label="Contato de emergência" value={patient.emergency_contact || "Não informado"} />
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h4 className="font-display font-semibold">Medicações atuais e alertas</h4>
        {meds.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nenhuma medicação ativa cadastrada.</p> : (
          <div className="mt-3 space-y-2">
            {meds.map((m: any) => (
              <div key={m.id} className="rounded-lg bg-secondary p-3 text-sm">
                <strong>{m.name}</strong>{m.dose && ` • ${m.dose}`}{m.schedule_time && ` • alerta ${m.schedule_time.slice(0, 5)}`}{m.frequency && ` • ${m.frequency}`}
                {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 shadow-card">
          <h4 className="font-display font-semibold">Últimos sinais vitais</h4>
          {!lastVitals ? <p className="mt-2 text-sm text-muted-foreground">Nenhum sinal vital registrado.</p> : (
            <p className="mt-2 text-sm text-muted-foreground">
              {new Date(lastVitals.measured_at).toLocaleString("pt-BR")}<br />
              {[lastVitals.systolic && lastVitals.diastolic && `PA ${lastVitals.systolic}/${lastVitals.diastolic}`, lastVitals.heart_rate && `FC ${lastVitals.heart_rate}`, lastVitals.glucose != null && `Glicemia ${lastVitals.glucose}`, lastVitals.temperature != null && `Temperatura ${lastVitals.temperature}°C`, lastVitals.oxygen_saturation && `SatO₂ ${lastVitals.oxygen_saturation}%`, lastVitals.pain_level != null && `Dor ${lastVitals.pain_level}/10`].filter(Boolean).join(" • ")}
            </p>
          )}
        </Card>

        <Card className="p-5 shadow-card">
          <h4 className="font-display font-semibold">Rotina e adesão</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Rotinas cadastradas: {routines.length}. Registros recentes concluídos: {routineLogs.length}.
          </p>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <h4 className="font-display font-semibold">Eventos recentes importantes</h4>
        {lastEvents.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nenhum evento registrado.</p> : (
          <ul className="mt-3 ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            {lastEvents.map((e: any) => <li key={e.id}>{new Date(e.occurred_at).toLocaleString("pt-BR")} — {EVENT_LABELS[e.type] ?? e.type}{e.value && ` (${e.value})`}{e.notes && `: ${e.notes}`}</li>)}
          </ul>
        )}
      </Card>

      <Card className="p-5 shadow-card">
        <h4 className="font-display font-semibold">Últimas confirmações de medicação</h4>
        {lastMeds.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nenhuma confirmação registrada.</p> : (
          <ul className="mt-3 ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            {lastMeds.map((l: any) => <li key={l.id}>{new Date(l.taken_at).toLocaleString("pt-BR")} — {statusLabel(l.status)}</li>)}
          </ul>
        )}
      </Card>

      <EditPatientDialog patient={patient} reload={reload} fullWidth />
    </div>
  );
}

function EditPatientDialog({ patient, reload, fullWidth = false }: any) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    full_name: patient.full_name ?? "",
    birth_date: patient.birth_date ?? "",
    diagnosis: patient.diagnosis ?? "",
    chronic_conditions: patient.chronic_conditions ?? "",
    continuous_medications: patient.continuous_medications ?? "",
    allergies: patient.allergies ?? "",
    emergency_contact: patient.emergency_contact ?? "",
    doctor_name: patient.doctor_name ?? "",
    notes: patient.notes ?? "",
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAction("Deseja realmente atualizar o cadastro clínico deste paciente?")) return;
    const age = f.birth_date ? Math.floor((Date.now() - new Date(f.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)) : null;
    const { error } = await supabase.from("patients").update({ ...f, age }).eq("id", patient.id);
    if (error) return toast.error(error.message);
    toast.success("Cadastro atualizado");
    setOpen(false);
    reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={fullWidth ? "default" : "sm"} className={fullWidth ? "w-full" : ""}>
          <Edit className="h-4 w-4" /> Editar cadastro/anamnese
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Editar cadastro clínico</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Nome completo</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required /></div>
            <div><Label>Data de nascimento</Label><Input type="date" value={f.birth_date ?? ""} onChange={(e) => setF({ ...f, birth_date: e.target.value })} /></div>
            <div><Label>Diagnóstico principal</Label><Input value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></div>
            <div><Label>Médico responsável</Label><Input value={f.doctor_name} onChange={(e) => setF({ ...f, doctor_name: e.target.value })} /></div>
          </div>
          <div><Label>Doenças de base</Label><Textarea value={f.chronic_conditions} onChange={(e) => setF({ ...f, chronic_conditions: e.target.value })} /></div>
          <div><Label>Medicações contínuas</Label><Textarea value={f.continuous_medications} onChange={(e) => setF({ ...f, continuous_medications: e.target.value })} /></div>
          <div><Label>Alergias</Label><Textarea value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} /></div>
          <div><Label>Contato de emergência</Label><Input value={f.emergency_contact} onChange={(e) => setF({ ...f, emergency_contact: e.target.value })} /></div>
          <div><Label>Observações para anamnese</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <Button type="submit" className="w-full">Salvar alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* REPORT */
function ReportTab({ patient, medsToday, routinesToday, eventsToday }: any) {
  return (
    <Card className="p-5 shadow-card">
      <h3 className="font-display text-lg font-bold">Relatório de hoje</h3>
      <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="mt-4 space-y-4 text-sm">
        <section>
          <h4 className="font-display font-semibold">Paciente</h4>
          <p className="text-muted-foreground">{patient.full_name}{patient.age && `, ${patient.age} anos`}{patient.diagnosis && ` — ${patient.diagnosis}`}</p>
        </section>

        <section>
          <h4 className="font-display font-semibold">Medicações ({medsToday.length})</h4>
          {medsToday.length === 0 ? <p className="text-muted-foreground">Nenhum registro.</p> :
            <ul className="ml-5 list-disc text-muted-foreground">
              {medsToday.map((l: any) => <li key={l.id}>{statusLabel(l.status)} — {new Date(l.taken_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</li>)}
            </ul>
          }
        </section>

        <section>
          <h4 className="font-display font-semibold">Rotinas concluídas ({routinesToday.length})</h4>
          {routinesToday.length === 0 ? <p className="text-muted-foreground">Nenhuma.</p> :
            <ul className="ml-5 list-disc text-muted-foreground">
              {routinesToday.map((l: any) => <li key={l.id}>Concluída às {new Date(l.completed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</li>)}
            </ul>
          }
        </section>

        <section>
          <h4 className="font-display font-semibold">Eventos ({eventsToday.length})</h4>
          {eventsToday.length === 0 ? <p className="text-muted-foreground">Sem ocorrências.</p> :
            <ul className="ml-5 list-disc text-muted-foreground">
              {eventsToday.map((e: any) => <li key={e.id}>{EVENT_LABELS[e.type] ?? e.type}{e.value && ` (${e.value})`} — {new Date(e.occurred_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</li>)}
            </ul>
          }
        </section>
      </div>

      <Button className="mt-5 w-full" onClick={() => window.print()}>Imprimir relatório</Button>
    </Card>
  );
}

/* VITALS */
const VITAL_FIELDS: { key: string; label: string; unit?: string; step?: string }[] = [
  { key: "systolic", label: "PA sistólica", unit: "mmHg" },
  { key: "diastolic", label: "PA diastólica", unit: "mmHg" },
  { key: "heart_rate", label: "Frequência cardíaca", unit: "bpm" },
  { key: "glucose", label: "Glicemia", unit: "mg/dL", step: "0.1" },
  { key: "temperature", label: "Temperatura", unit: "°C", step: "0.1" },
  { key: "oxygen_saturation", label: "Saturação O₂", unit: "%" },
  { key: "weight", label: "Peso", unit: "kg", step: "0.1" },
  { key: "pain_level", label: "Dor (0–10)" },
];

function VitalsTab({ patientId, userId, vitals, reload }: any) {
  const [open, setOpen] = useState(false);
  const empty: Record<string, string> = { notes: "" };
  VITAL_FIELDS.forEach((f) => (empty[f.key] = ""));
  const [f, setF] = useState<Record<string, string>>(empty);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAction("Deseja salvar estes sinais vitais no histórico do paciente?")) return;
    const payload: any = { patient_id: patientId, recorded_by: userId, notes: f.notes || null };
    let hasAny = false;
    VITAL_FIELDS.forEach((fld) => {
      if (f[fld.key] !== "") { payload[fld.key] = Number(f[fld.key]); hasAny = true; }
    });
    if (!hasAny) return toast.error("Preencha pelo menos um valor");
    const { error } = await supabase.from("vitals").insert(payload);
    if (error) return toast.error(error.message);
    setF(empty); setOpen(false);
    toast.success("Sinais registrados"); reload();
  };

  const chartData = [...vitals].reverse().map((v: any) => ({
    t: new Date(v.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
       new Date(v.measured_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    sistolica: v.systolic, diastolica: v.diastolic, fc: v.heart_rate,
    glicemia: v.glucose, temperatura: v.temperature, saturacao: v.oxygen_saturation,
  }));

  const latest = vitals[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Registrar sinais</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Sinais vitais</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {VITAL_FIELDS.map((fld) => (
                  <div key={fld.key}>
                    <Label className="text-xs">{fld.label}{fld.unit && ` (${fld.unit})`}</Label>
                    <Input type="number" step={fld.step ?? "1"} inputMode="decimal"
                      value={f[fld.key]} onChange={(e) => setF({ ...f, [fld.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div><Label>Observações</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {latest && (
        <Card className="p-4 shadow-card">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Última medição — {new Date(latest.measured_at).toLocaleString("pt-BR")}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {VITAL_FIELDS.map((fld) => latest[fld.key] != null && (
              <div key={fld.key} className="rounded-lg bg-secondary p-2">
                <p className="text-[10px] uppercase text-muted-foreground">{fld.label}</p>
                <p className="font-display text-lg font-semibold">{latest[fld.key]}{fld.unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{fld.unit}</span>}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {chartData.length >= 2 ? (
        <>
          <Card className="p-4 shadow-card">
            <h3 className="mb-3 font-display text-sm font-semibold">Pressão arterial</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="sistolica" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="diastolica" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 shadow-card">
            <h3 className="mb-3 font-display text-sm font-semibold">Glicemia, FC, Saturação, Temperatura</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="glicemia" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fc" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="saturacao" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temperatura" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      ) : (
        <Card className="p-6 text-center text-sm text-muted-foreground">Registre 2 ou mais medições para ver os gráficos.</Card>
      )}

      {vitals.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm font-semibold">Histórico</h3>
          <div className="space-y-1">
            {vitals.slice(0, 15).map((v: any) => (
              <div key={v.id} className="rounded-lg bg-secondary px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{new Date(v.measured_at).toLocaleString("pt-BR")}</span>
                </div>
                <div className="mt-1 text-muted-foreground">
                  {[
                    v.systolic && v.diastolic && `PA ${v.systolic}/${v.diastolic}`,
                    v.heart_rate && `FC ${v.heart_rate}`,
                    v.glucose != null && `Glic ${v.glucose}`,
                    v.temperature != null && `T ${v.temperature}°C`,
                    v.oxygen_saturation && `SatO₂ ${v.oxygen_saturation}%`,
                    v.weight != null && `${v.weight}kg`,
                    v.pain_level != null && `Dor ${v.pain_level}`,
                  ].filter(Boolean).join(" • ")}
                </div>
                {v.notes && <p className="mt-0.5">{v.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
