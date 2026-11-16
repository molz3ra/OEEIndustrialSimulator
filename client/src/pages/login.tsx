import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, ShieldCheck, User } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setIsSubmitting(true);
      await login({ username, password });
      toast({
        variant: "success",
        title: t("common.success"),
        description: `Bem-vindo ao sistema OEE!`,
      });
      navigate("/operador");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: err.message || "Falha na autenticação",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-lg">
            OEE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.loginSubtitle")}
          </p>
        </div>

        <Card className="border-border/80 shadow-2xl bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Identificação</CardTitle>
            <CardDescription>
              Informe seu usuário e senha de operador ou gestor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <Input
                  id="username"
                  autoFocus
                  required
                  placeholder="ex: operador ou gerente"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t space-y-2">
              <span className="text-xs text-muted-foreground block text-center font-medium">
                Acesso Rápido para Teste / Demonstração:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => fillCredentials("operador", "operador123")}
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Operador
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => fillCredentials("gerente", "gerente123")}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Gerente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
