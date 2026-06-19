import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { reservationsApi, type Stay, staysApi } from "@/lib/api";

export const Route = createFileRoute("/stays")({ component: StaysPage });

const emptyForm = { reservationId: "", actualCheckIn: "", actualCheckOut: "" };

function StaysPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["stays"],
    queryFn: staysApi.list,
  });
  const { data: reservations = [] } = useQuery({
    queryKey: ["reservations"],
    queryFn: reservationsApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Stay | null>(null);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        reservationId: form.reservationId,
        actualCheckIn: form.actualCheckIn,
        ...(form.actualCheckOut ? { actualCheckOut: form.actualCheckOut } : {}),
      };
      return editing
        ? staysApi.update(editing.idStay, payload)
        : staysApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stays"] });
      close();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => staysApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stays"] }),
  });

  function open_(s?: Stay) {
    setEditing(s ?? null);
    setForm(
      s
        ? {
            reservationId: s.reservation.idReservation,
            actualCheckIn: s.actualCheckIn?.slice(0, 16) ?? "",
            actualCheckOut: s.actualCheckOut?.slice(0, 16) ?? "",
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
        <h1 className="font-bold text-2xl">Estadias</h1>
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
              {["Hospede", "Check-in real", "Check-out real", ""].map((h) => (
                <th className="px-4 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr className="border-t" key={s.idStay}>
                <td className="px-4 py-2">{s.reservation.guest.name}</td>
                <td className="px-4 py-2">
                  {s.actualCheckIn
                    ? new Date(s.actualCheckIn).toLocaleString("pt-BR")
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  {s.actualCheckOut
                    ? new Date(s.actualCheckOut).toLocaleString("pt-BR")
                    : "-"}
                </td>
                <td className="flex gap-2 px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => open_(s)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => remove.mutate(s.idStay)}
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
              {editing ? "Editar Estadia" : "Nova Estadia"}
            </h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                Reserva
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("reservationId", e.target.value)}
                  value={form.reservationId}
                >
                  <option value="">Selecione...</option>
                  {reservations.map((r) => (
                    <option key={r.idReservation} value={r.idReservation}>
                      {r.guest.name} — {r.room.roomNumber} ({r.checkInDate})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Check-in real
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("actualCheckIn", e.target.value)}
                  type="datetime-local"
                  value={form.actualCheckIn}
                />
              </label>
              <label className="text-sm">
                Check-out real (opcional)
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("actualCheckOut", e.target.value)}
                  type="datetime-local"
                  value={form.actualCheckOut}
                />
              </label>
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
