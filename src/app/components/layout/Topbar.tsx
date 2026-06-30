import { useLocation, useNavigate } from "react-router";
import { Menu, Sun, Moon, Plus } from "lucide-react";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/app": {
    title: "Dashboard",
    description: "Visão geral do sistema de gestão de veículos",
  },
  "/app/vehicles": {
    title: "Veículos",
    description: "Gerencie todos os seus veículos em um só lugar",
  },
  "/app/tires": {
    title: "Pneus",
    description: "Cadastre, troque e acompanhe o desgaste dos pneus",
  },
  "/app/trips": {
    title: "Viagens",
    description: "Registre viagens e veja o impacto na vida útil dos pneus",
  },
  "/app/settings": {
    title: "Configurações",
    description: "Perfil, preferências, segurança e exportação de dados",
  },
};

function formatDateBR(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Topbar({ onMobileMenuToggle, isDark, onToggleDark }: TopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[pathname] ?? PAGE_META["/app"];

  return (
    <header
      className="flex h-16 flex-shrink-0 items-center gap-3 border-b px-4 lg:px-6"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuToggle}
        aria-label="Abrir menu"
        className="rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
        style={{ color: "var(--text-secondary)" }}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-base font-semibold leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {meta.title}
        </h1>
        <p
          className="hidden truncate text-xs sm:block"
          style={{ color: "var(--text-secondary)" }}
        >
          {meta.description}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {/* Date badge */}
        <span
          className="hidden rounded-full border px-3 py-1 text-xs sm:block"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)" }}
        >
          {formatDateBR()}
        </span>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          aria-label={isDark ? "Modo claro" : "Modo escuro"}
          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* New trip button */}
        <button
          onClick={() => void navigate("/app/trips")}
          className="flex items-center gap-1.5 rounded-lg bg-[#16a34a] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:block">Nova viagem</span>
        </button>
      </div>
    </header>
  );
}
