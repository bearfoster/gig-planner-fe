import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CurrentUserDto as CurrentUser } from "@gig-planner/api-client/generated/models";
import {
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
} from "@gig-planner/api-client/generated/user/user";

type Role = "user" | "admin";
type AuthValue = {
  user?: CurrentUser;
  isLoading: boolean;
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
};
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [role, setRoleState] = useState<Role>(() =>
    localStorage.getItem("sgp-mock-role") === "admin" ? "admin" : "user",
  );
  const query = useGetCurrentUser();
  const setRole = useCallback(
    (next: Role) => {
      localStorage.setItem("sgp-mock-role", next);
      setRoleState(next);
      void client.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    },
    [client],
  );
  const value = useMemo(
    () => ({
      user: query.data,
      isLoading: query.isLoading,
      role,
      setRole,
      isAdmin: query.data?.roles.includes("admin") ?? false,
    }),
    [query.data, query.isLoading, role, setRole],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useCurrentUser() {
  const value = useContext(AuthContext);
  if (!value)
    throw new Error("useCurrentUser must be used within AuthProvider");
  return value;
}
