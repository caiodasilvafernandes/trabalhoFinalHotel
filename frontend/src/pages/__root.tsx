import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Bed, Calendar, CreditCard, Key, Package, Users } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
});

const NAV = [
  { to: "/rooms", label: "Quartos", icon: Bed },
  { to: "/guests", label: "Hóspedes", icon: Users },
  { to: "/reservations", label: "Reservas", icon: Calendar },
  { to: "/stays", label: "Estadias", icon: Key },
  { to: "/services", label: "Serviços", icon: Package },
  { to: "/consumptions", label: "Consumos", icon: CreditCard },
];

function RootComponent() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-56 flex-col bg-zinc-950 text-white">
        <div className="flex items-center gap-2 border-zinc-800 border-b px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm text-white">
            H
          </div>
          <span className="font-semibold text-sm tracking-wide">
            Hotel Manager
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                activeProps={{
                  className:
                    "flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2.5 text-sm font-medium text-blue-400",
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                key={n.to}
                to={n.to}
              >
                <Icon size={16} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
