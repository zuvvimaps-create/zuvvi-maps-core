import { Moon, Search, Settings, Sun } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import { ZuvviLogo } from "@/components/layout/ZuvviLogo";

interface AppHeaderProps {
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function AppHeader({ onOpenSearch, onOpenProfile, onOpenSettings }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 z-30 px-4 pt-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <ZuvviLogo />

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
              onClick={toggleTheme}
              className="glass grid h-10 w-10 place-items-center rounded-xl text-foreground shadow-e2 transition-colors hover:text-primary"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Configurações"
              onClick={onOpenSettings}
              className="glass grid h-10 w-10 place-items-center rounded-xl text-foreground shadow-e2 transition-colors hover:text-primary"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Perfil"
              onClick={onOpenProfile}
              className="gradient-brand grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-primary-foreground shadow-glow"
            >
              AD
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSearch}
          className="glass group flex h-14 w-full items-center gap-3 rounded-2xl px-4 text-left shadow-e3 transition-all duration-300 hover:shadow-glow"
        >
          <span className="gradient-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-glow">
            <Search className="h-4 w-4" strokeWidth={2.6} />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold text-foreground">
              Para onde você vai?
            </span>
            <span className="text-[11px] text-muted-foreground">
              Busque locais, endereços ou categorias
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
