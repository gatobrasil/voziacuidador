import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

let timer: number | null = null;
const fired = new Set<string>(); // key = medId+HH:MM+YYYY-MM-DD

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const p = await Notification.requestPermission();
  return p === "granted";
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR"; u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

async function tick() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const today = now.toISOString().slice(0, 10);

  const { data: meds } = await supabase
    .from("medications")
    .select("id, name, dose, schedule_time, patient_id, patients(full_name)")
    .eq("active", true)
    .not("schedule_time", "is", null);

  if (!meds) return;

  for (const m of meds as any[]) {
    const t = (m.schedule_time as string).slice(0, 5);
    if (t !== `${hh}:${mm}`) continue;
    const key = `${m.id}-${t}-${today}`;
    if (fired.has(key)) continue;
    fired.add(key);

    const patientName = m.patients?.full_name ?? "Paciente";
    const title = `💊 Hora da medicação`;
    const body = `${patientName}: ${m.name}${m.dose ? ` (${m.dose})` : ""} às ${t}`;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, tag: key });
    }
    toast(title, { description: body, duration: 15000 });
    speak(`Hora da medicação. ${m.name} para ${patientName}.`);
  }
}

export function startMedicationAlerts() {
  if (timer != null) return;
  void tick();
  timer = window.setInterval(tick, 60_000);
}

export function stopMedicationAlerts() {
  if (timer != null) { window.clearInterval(timer); timer = null; }
}
