import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/AuthProvider";
export function AdminGuard() {
  const { isAdmin, isLoading } = useCurrentUser();
  const location = useLocation();
  if (isLoading)
    return <div className="p-10 text-center">Checking access…</div>;
  return isAdmin ? (
    <Outlet />
  ) : (
    <Navigate
      to="/profile"
      replace
      state={{ from: location.pathname, adminRequired: true }}
    />
  );
}
