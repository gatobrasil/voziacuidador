import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const [su, setSu] = useState({ name: "", email: "", password: "" });
  const [li, setLi] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/painel" });
    }
  }, [user, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: su.email,
      password: su.password,
      options: {
        emailRedirectTo: "http://localhost:8080/painel",
        data: { full_name: su.name, role: "familiar_admin" },
      },
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data?.session?.user) {
      await supabase.from("profiles").insert({
        id: data.session.user.id,
        full_name: su.name,
        role: "familiar_admin",
      });
    }

    toast.success("Conta criada com sucesso!");
    navigate({ to: "/painel" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword(li);

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate({ to: "/painel" });
  };

  const handleForgotPassword = async () => {
    if (!li.email) {
      toast.error("Digite seu e-mail primeiro.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.resetPasswordForEmail(li.email, {
      redirectTo: "http://localhost:8080/resetar-senha",
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Link de recuperação enviado para o e-mail.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-medical text-white">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-display text-xl font-bold">Vozia Cuidador</span>
        </Link>

        <Card className="p-6 shadow-card">
          <div className="mb-4 rounded-xl border border-warning/40 bg-warning/5 p-3 text-xs leading-5 text-muted-foreground">
            O Vozia Cuidador é uma ferramenta de apoio à organização do cuidado.
            Não substitui médico, diagnóstico, prescrição ou emergência.{" "}
            <Link to="/protecao" className="font-medium text-primary underline">
              Ler aviso completo
            </Link>
            .
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-l">E-mail</Label>
                  <Input
                    id="email-l"
                    type="email"
                    required
                    value={li.email}
                    onChange={(e) => setLi({ ...li, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pwd-l">Senha</Label>
                  <Input
                    id="pwd-l"
                    type="password"
                    required
                    value={li.password}
                    onChange={(e) => setLi({ ...li, password: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={busy}>
                  Entrar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  disabled={busy}
                  onClick={handleForgotPassword}
                >
                  Esqueci minha senha
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-s">Nome completo</Label>
                  <Input
                    id="name-s"
                    required
                    value={su.name}
                    onChange={(e) => setSu({ ...su, name: e.target.value })}
                  />
                </div>

                <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                  Este cadastro é único para a família responsável. Só quem tiver e-mail e senha poderá alterar as informações do paciente.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="email-s">E-mail</Label>
                  <Input
                    id="email-s"
                    type="email"
                    required
                    value={su.email}
                    onChange={(e) => setSu({ ...su, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pwd-s">Senha (mín. 6 caracteres)</Label>
                  <Input
                    id="pwd-s"
                    type="password"
                    required
                    minLength={6}
                    value={su.password}
                    onChange={(e) => setSu({ ...su, password: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={busy}>
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}