import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  guestsApi,
  type Reservation,
  type ReservationStatus,
  reservationsApi,
  roomsApi,
} from "@/lib/api";

export const Route = createFileRoute("/reservations")({
  component: ReservationsPage,
});

const emptyForm = {
  guestId: "",
  roomId: "",
  checkInDate: "",
  checkOutDate: "",
  status: "pendente" as ReservationStatus,
};

function ReservationsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: reservationsApi.list,
  });
  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: guestsApi.list,
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () =>
      editing
        ? reservationsApi.update(editing.idReservation, form)
        : reservationsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      close();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => reservationsApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["reservations"] });
      const prev = qc.getQueryData<Reservation[]>(["reservations"]);
      qc.setQueryData<Reservation[]>(["reservations"], (old) =>
        old?.filter((r) => r.idReservation !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["reservations"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });

  function open_(r?: Reservation) {
    setEditing(r ?? null);
    setForm(
      r
        ? {
            guestId: r.guest.idGuest,
            roomId: r.room.idRoom,
            checkInDate: r.checkInDate,
            checkOutDate: r.checkOutDate,
            status: r.status,
          }
        : emptyForm
    );
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
  }
  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Reservas</h1>
        <button
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
          onClick={() => open_()}
        >
          + Nova
        </button>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full rounded bg-white text-sm shadow">
          <thead className="bg-zinc-100">
            <tr>
              {["Hóspede", "Quarto", "Check-in", "Check-out", "Status", ""].map(
                (h) => (
                  <th className="px-4 py-2 text-left" key={h}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr className="border-t" key={r.idReservation}>
                <td className="px-4 py-2">{r.guest.name}</td>
                <td className="px-4 py-2">{r.room.roomNumber}</td>
                <td className="px-4 py-2">{r.checkInDate}</td>
                <td className="px-4 py-2">{r.checkOutDate}</td>
                <td className="px-4 py-2 capitalize">{r.status}</td>
                <td className="flex gap-2 px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => open_(r)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => remove.mutate(r.idReservation)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 font-semibold text-lg">
              {editing ? "Editar Reserva" : "Nova Reserva"}
            </h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                Hóspede
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("guestId", e.target.value)}
                  value={form.guestId}
                >
                  <option value="">Selecione...</option>
                  {guests.map((g) => (
                    <option key={g.idGuest} value={g.idGuest}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Quarto
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("roomId", e.target.value)}
                  value={form.roomId}
                >
                  <option value="">Selecione...</option>
                  {rooms.map((r) => (
                    <option key={r.idRoom} value={r.idRoom}>
                      {r.roomNumber} — {r.roomType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Check-in
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("checkInDate", e.target.value)}
                  type="date"
                  value={form.checkInDate}
                />
              </label>
              <label className="text-sm">
                Check-out
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("checkOutDate", e.target.value)}
                  type="date"
                  value={form.checkOutDate}
                />
              </label>
              {editing && (
                <label className="text-sm">
                  Status
                  <select
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                    onChange={(e) => set("status", e.target.value)}
                    value={form.status}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </label>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded border px-4 py-2 text-sm"
                onClick={close}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
                onClick={() => save.mutate()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
