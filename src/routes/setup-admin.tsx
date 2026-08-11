import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkHasAdmin, createFirstAdmin } from "@/lib/auth.functions";

export const Route = createFileRoute("/setup-admin")({
  head: () => ({
    meta: [
      { title: "Criar administrador — SíndicoLab" },
      { name: "description", content: "Crie a primeira conta de administrador do portal." },
    ],
  }),
  component: SetupAdminPage,
  loader: async () => {
    const { hasAdmin } = await checkHasAdmin();
    return { hasAdmin };
  },
});

function SetupAdminPage() {
  const { hasAdmin } = Route.useLoaderData();
  const navigate = useNavigate();
  const createFirstAdminFn = useServerFn(createFirstAdmin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasAdmin) {
      toast.error("Já existe um administrador. Faça login normalmente.");
      navigate({ to: "/auth" });
    }
  }, [hasAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFirstAdminFn({ data: { email, password } });
      toast.success("Administrador criado com sucesso! Faça login para continuar.");
      navigate({ to: "/auth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar administrador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Criar administrador
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie a primeira conta de administrador do SíndicoLab.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@sindicolab.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar conta de administrador"}
          </Button>
        </form>
      </div>
    </div>
  );
}
