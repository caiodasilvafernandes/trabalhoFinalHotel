import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

const NAV = [
  { to: "/rooms", label: "Quartos" },
  { to: "/guests", label: "Hóspedes" },
  { to: "/reservations", label: "Reservas" },
  { to: "/stays", label: "Estadias" },
  { to: "/services", label: "Serviços" },
  { to: "/consumptions", label: "Consumos" },
];

function RootComponent() {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-48 flex-col gap-1 bg-zinc-900 p-4 text-white">
        <span className="mb-4 font-bold text-lg">Hotel</span>
        {NAV.map((n) => (
          <Link
            activeProps={{ className: "px-3 py-2 rounded bg-zinc-700 text-sm" }}
            className="rounded px-3 py-2 text-sm hover:bg-zinc-700"
            key={n.to}
            to={n.to}
          >
            {n.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 bg-zinc-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}
