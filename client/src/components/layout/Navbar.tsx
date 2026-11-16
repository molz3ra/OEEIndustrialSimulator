import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { changeLanguage } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { Machine } from "@shared/schema";
import {
  Activity,
  BarChart3,
  Cog,
  FileSpreadsheet,
  Globe,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, selectedMachineId, setSelectedMachineId } = useAuth();
  const location = useLocation();

  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    staleTime: 30000,
  });

  const currentMachine = machines.find((m) => m.id === selectedMachineId);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Machine Picker */}
        <div className="flex items-center gap-6">
          <Link to="/operador" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-white hover:opacity-90">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-black">
              OEE
            </div>
            <span className="hidden sm:inline">SIMULATOR</span>
          </Link>

          {/* Machine Quick Selector */}
          <div className="w-56 sm:w-64">
            <Select
              value={selectedMachineId ? selectedMachineId.toString() : ""}
              onValueChange={(val) => setSelectedMachineId(parseInt(val, 10))}
            >
              <SelectTrigger className="h-9 bg-card border-border text-xs sm:text-sm font-medium">
                <SelectValue placeholder={t("operator.selectMachine")}>
                  {currentMachine ? (
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          currentMachine.status === "running"
                            ? "bg-emerald-500"
                            : currentMachine.status === "stopped"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span className="truncate">{currentMachine.name}</span>
                    </div>
                  ) : (
                    t("operator.selectMachine")
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {machines.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.status === "running"
                            ? "bg-emerald-500"
                            : m.status === "stopped"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span>{m.code} - {m.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/operador">
            <Button
              variant={location.pathname === "/operador" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              {t("nav.operator")}
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button
              variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {t("nav.dashboard")}
            </Button>
          </Link>

          <Link to="/producao">
            <Button
              variant={location.pathname === "/producao" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t("nav.production")}
            </Button>
          </Link>

          {(user?.role === "admin" || user?.role === "manager") && (
            <Link to="/maquinas">
              <Button
                variant={location.pathname === "/maquinas" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Cog className="w-4 h-4" />
                {t("nav.machines")}
              </Button>
            </Link>
          )}
        </nav>

        {/* Right: Language Toggle & User Menu */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => changeLanguage("pt-BR")}
                className={i18n.language === "pt-BR" ? "font-bold text-primary" : ""}
              >
                Português (BR)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLanguage("en")}
                className={i18n.language === "en" ? "font-bold text-primary" : ""}
              >
                English (US)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Badge / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l">
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="font-semibold text-foreground leading-none">
                {user?.displayName}
              </span>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider mt-0.5">
                {user?.role}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => logout()}
              title={t("auth.logout")}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
