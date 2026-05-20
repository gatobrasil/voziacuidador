import { supabase } from "@/integrations/supabase/client";

type UsageAction =
  | "page_view"
  | "login"
  | "patient_created"
  | "medication_logged"
  | "routine_logged"
  | "event_created"
  | "vital_recorded"
  | "report_generated";

export async function trackUsage(action: UsageAction, area: string, patientId?: string | null, metadata: Record<string, unknown> = {}) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    await (supabase as any).from("platform_usage_logs").insert({
      user_id: user.id,
      action,
      area,
      patient_id: patientId ?? null,
      metadata,
    });
  } catch (error) {
    // Não bloqueia o uso do app caso a tabela ainda não exista no Supabase local.
    console.debug("Uso não registrado:", error);
  }
}
