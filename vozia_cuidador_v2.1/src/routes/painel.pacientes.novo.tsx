import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Camera, User } from "lucide-react";

export const Route = createFileRoute("/painel/pacientes/novo")({
  component: NewPatient,
});

function NewPatient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [f, setF] = useState({
    full_name: "", birth_date: "", diagnosis: "",
    chronic_conditions: "", continuous_medications: "", allergies: "",
    emergency_contact: "", doctor_name: "", notes: "",
  });

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Foto deve ter no máximo 5MB");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Deseja confirmar o cadastro deste paciente?")) return;
    if (!user) return;
    setBusy(true);
    const age = f.birth_date
      ? Math.floor((Date.now() - new Date(f.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
      : null;

    let photo_url: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("patient-photos").upload(path, photoFile, { upsert: false });
      if (up.error) { setBusy(false); return toast.error("Erro ao enviar foto: " + up.error.message); }
      photo_url = path;
    }

    const { data, error } = await supabase.from("patients").insert({
      owner_id: user.id,
      full_name: f.full_name,
      name: f.full_name,
      birth_date: f.birth_date || null,
      age,
      diagnosis: f.diagnosis || null,
      chronic_conditions: f.chronic_conditions || null,
      continuous_medications: f.continuous_medications || null,
      allergies: f.allergies || null,
      emergency_contact: f.emergency_contact || null,
      doctor_name: f.doctor_name || null,
      notes: f.notes || null,
      photo_url,
    } as any).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Paciente cadastrado!");
    navigate({ to: "/painel/paciente/$id", params: { id: data.id } });
  };

  return (
    <div className="space-y-4">
      <Link to="/painel/pacientes" className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
      <h1 className="font-display text-2xl font-bold">Novo paciente</h1>

      <Card className="p-5 shadow-card">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <label className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full bg-secondary ring-2 ring-border transition hover:ring-primary">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <User className="h-10 w-10" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1 text-[10px] font-medium text-white">
                <Camera className="h-3 w-3" /> Foto
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </label>
            <p className="text-xs text-muted-foreground">Opcional • até 5MB</p>
          </div>

          <Field label="Nome completo" required value={f.full_name} onChange={(v) => setF({ ...f, full_name: v })} />
          <Field label="Data de nascimento" type="date" value={f.birth_date} onChange={(v) => setF({ ...f, birth_date: v })} />
          <Field label="Diagnóstico principal" value={f.diagnosis} onChange={(v) => setF({ ...f, diagnosis: v })} />
          <TextField label="Doenças de base (HAS, diabetes, etc.)" value={f.chronic_conditions} onChange={(v) => setF({ ...f, chronic_conditions: v })} />
          <TextField label="Medicações de uso contínuo" value={f.continuous_medications} onChange={(v) => setF({ ...f, continuous_medications: v })} />
          <TextField label="Alergias" value={f.allergies} onChange={(v) => setF({ ...f, allergies: v })} />
          <Field label="Contato de emergência" value={f.emergency_contact} onChange={(v) => setF({ ...f, emergency_contact: v })} />
          <Field label="Médico responsável" value={f.doctor_name} onChange={(v) => setF({ ...f, doctor_name: v })} />
          <TextField label="Observações" value={f.notes} onChange={(v) => setF({ ...f, notes: v })} />
          <Button type="submit" className="w-full h-11" disabled={busy}>Cadastrar paciente</Button>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && " *"}</Label>
      <Input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} />
    </div>
  );
}
