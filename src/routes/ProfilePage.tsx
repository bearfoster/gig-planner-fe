import { ShieldCheck, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ProfilePage() {
  useDocumentTitle("Profile");
  const { user, role, setRole, isLoading } = useCurrentUser();
  const location = useLocation();
  const adminRequired = (location.state as { adminRequired?: boolean } | null)
    ?.adminRequired;
  const switchRole = (next: "user" | "admin") => {
    setRole(next);
    toast.success(`Mock role switched to ${next}`);
  };
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-violet">
          Mock account
        </p>
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Profile</h1>
      </header>
      {adminRequired && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-coral/30 bg-coral/10 p-4 font-semibold"
        >
          Switch to the admin role below to open event administration.
        </div>
      )}
      <Card className="p-6 sm:p-8">
        {isLoading ? (
          <p>Loading profile…</p>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid size-24 shrink-0 place-items-center rounded-full bg-coral text-3xl font-bold">
              {user?.initials ?? <UserRound />}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user?.name}</h2>
              <p className="mt-1 text-ink/55">{user?.email}</p>
              <div className="mt-4 flex gap-2">
                {user?.roles.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="my-8 border-t border-ink/10" />
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-violet" />
            <h2 className="text-xl font-bold">Development role switcher</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/55">
            Demo only. A real backend must independently enforce authentication
            and authorisation.
          </p>
          <div className="mt-5 flex gap-3">
            <Button
              variant={role === "user" ? "default" : "outline"}
              onClick={() => switchRole("user")}
            >
              User
            </Button>
            <Button
              variant={role === "admin" ? "default" : "outline"}
              onClick={() => switchRole("admin")}
            >
              Admin
            </Button>
          </div>
        </div>
      </Card>
      {import.meta.env.DEV && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={async () => {
            await fetch("/api/v1/mock/reset", { method: "POST" });
            window.location.reload();
          }}
        >
          Reset mock data
        </Button>
      )}
    </div>
  );
}
