import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserRole } from "@/types";

interface RoleOption {
  id: UserRole;
  label: string;
  description: string;
}

export const roleOptions: RoleOption[] = [
  { id: "user", label: "Passageiro", description: "Buscar, rotas e corridas" },
  { id: "driver", label: "Motorista", description: "Fila de corridas e status" },
  { id: "business_owner", label: "Parceiro", description: "Gestão do seu local" },
  { id: "admin", label: "Administrador", description: "Backoffice e frota" },
];

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  option: RoleOption;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("user");
  const value = useMemo(
    () => ({
      role,
      setRole,
      option: roleOptions.find((item) => item.id === role) ?? roleOptions[0]!,
    }),
    [role],
  );
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
