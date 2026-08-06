import { Menu, Music2, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

const nav = [
  ["Discover", "/"],
  ["Gigs", "/events"],
  ["Artists", "/artists"],
  ["Venues", "/venues"],
  ["Favourites", "/favourites"],
  ["Weekend plan", "/weekend"],
] as const;
export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useCurrentUser();
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <a
        href="#main"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-full bg-lime px-4 py-2 font-bold focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-full bg-ink text-lime">
              <Music2 size={18} />
            </span>
            Sydney Gig Planner
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {nav.map(([label, to]) => (
              <NavLink
                end={to === "/"}
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-2 text-sm font-semibold hover:bg-white",
                    isActive && "bg-ink text-white hover:bg-ink",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin/events"
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-2 text-sm font-semibold text-violet hover:bg-white",
                    isActive && "bg-violet text-white",
                  )
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="hidden items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-2 text-sm font-semibold sm:flex"
            >
              <span className="grid size-7 place-items-center rounded-full bg-coral text-xs">
                {user?.initials ?? <UserRound size={14} />}
              </span>
              {user?.name?.split(" ")[0] ?? "Profile"}
            </Link>
            <button
              className="grid size-10 place-items-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-label="Toggle navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            aria-label="Mobile"
            className="grid border-t border-ink/10 bg-paper p-3 lg:hidden"
          >
            {nav.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-white"
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin/events"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-violet"
              >
                Admin
              </NavLink>
            )}
          </nav>
        )}
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-ink/15 bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-2xl font-bold">
              Your Sydney weekend,
              <br />
              <span className="text-lime">turned up.</span>
            </p>
            <p className="mt-3 text-sm text-white/55">
              All events, dates and prices are fictional demonstration data.
            </p>
          </div>
          <div className="text-sm text-white/55">
            Built for Eora / Sydney · 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
