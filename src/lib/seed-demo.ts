import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function seedDemoData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return toast.error("Faça login primeiro");

  const { data: patient, error } = await supabase.from("patients").insert({
    owner_id: user.id,
    full_name: "Dona Helena Souza",
    age: 78,
    diagnosis: "Alzheimer leve, hipertensão",
    allergies: "Penicilina",
    emergency_contact: "Carlos (filho) — (11) 99876-5432",
    doctor_name: "Dr. Ricardo Mendes — Geriatria",
    notes: "Prefere conversar pela manhã. Mora com cuidadora 24h.",
  }).select().single();
  if (error || !patient) return toast.error(error?.message ?? "Erro");

  await supabase.from("medications").insert([
    { patient_id: patient.id, name: "Donepezila", dose: "10mg", schedule_time: "08:00", frequency: "1x ao dia", duration: "Contínuo", notes: "Pela manhã, em jejum" },
    { patient_id: patient.id, name: "Losartana", dose: "50mg", schedule_time: "08:00", frequency: "1x ao dia", duration: "Contínuo" },
    { patient_id: patient.id, name: "Sinvastatina", dose: "20mg", schedule_time: "20:00", frequency: "1x ao dia", duration: "Contínuo" },
    { patient_id: patient.id, name: "Paracetamol", dose: "750mg", schedule_time: "14:00", frequency: "Se necessário", duration: "Conforme dor" },
  ]);

  await supabase.from("routines").insert([
    { patient_id: patient.id, type: "banho" as any, schedule_time: "09:00" },
    { patient_id: patient.id, type: "alimentacao" as any, schedule_time: "07:30", notes: "Café da manhã reforçado" },
    { patient_id: patient.id, type: "hidratacao" as any, schedule_time: "10:00", notes: "Mínimo 1,5L ao dia" },
    { patient_id: patient.id, type: "fisioterapia" as any, schedule_time: "15:00" },
    { patient_id: patient.id, type: "caminhada" as any, schedule_time: "16:30" },
    { patient_id: patient.id, type: "troca_posicao" as any, notes: "A cada 2h" },
    { patient_id: patient.id, type: "sono" as any, schedule_time: "21:30" },
  ]);

  await supabase.from("events").insert([
    { patient_id: patient.id, type: "pressao" as any, value: "13/8", notes: "Estável", recorded_by: user.id },
    { patient_id: patient.id, type: "glicemia" as any, value: "108 mg/dL", recorded_by: user.id },
    { patient_id: patient.id, type: "alimentacao" as any, value: "Aceitou bem", notes: "Almoço completo", recorded_by: user.id },
  ]);

  toast.success("Dados de exemplo carregados!");
}
