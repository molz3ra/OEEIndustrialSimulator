import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
      <AlertCircle className="w-16 h-16 text-rose-500 animate-pulse" />
      <h1 className="text-4xl font-black">404</h1>
      <p className="text-muted-foreground max-w-sm">
        A página industrial solicitada não existe ou foi movida.
      </p>
      <Link to="/operador">
        <Button className="gap-2 font-bold">
          <Home className="w-4 h-4" />
          Voltar para Operação
        </Button>
      </Link>
    </div>
  );
}
