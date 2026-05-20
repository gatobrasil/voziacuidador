import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/resetar-senha")({
  component: ResetarSenhaPage,
});

function ResetarSenhaPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function handleRecovery() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            toast.error("Link inválido ou expirado. Solicite um novo link.");
            setReady(true);
            return;
          }
        }

        const hash = window.location.hash;

        if (hash.includes("access_token")) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              toast.error("Não foi possível validar o link.");
              setReady(true);
              return;
            }
          }
        }

        setReady(true);
      } catch {
        toast.error("Erro ao validar o link de recuperação.");
        setReady(true);
      }
    }

    handleRecovery();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setBusy(true);

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      setBusy(false);
      toast.error("Sessão de recuperação não encontrada. Solicite um novo link.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Senha alterada com sucesso!");

    await supabase.auth.signOut();

    navigate({ to: "/login" });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            Validando link de recuperação...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 shadow-card">
        <h1 className="mb-2 font-display text-2xl font-bold">
          Redefinir senha
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Digite sua nova senha para acessar o Vozia Cuidador.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label>Nova senha</Label>

            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={busy}>
            Salvar nova senha
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full text-sm"
          onClick={() => navigate({ to: "/login" })}
        >
          Voltar para login
        </Button>
      </Card>
    </div>
  );
}