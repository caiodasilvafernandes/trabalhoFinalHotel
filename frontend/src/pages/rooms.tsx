import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Room, type RoomStatus, type RoomType, roomsApi } from "@/lib/api";

export const Route = createFileRoute("/rooms")({ component: RoomsPage });

const emptyForm = {
  roomNumber: "",
  roomType: "individual" as RoomType,
  dailyRate: 0,
  roomStatus: "livre" as RoomStatus,
};

function RoomsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () =>
      editing ? roomsApi.update(editing.idRoom, form) : roomsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      close();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });

  function open_(room?: Room) {
    setEditing(room ?? null);
    setForm(
      room
        ? {
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            dailyRate: room.dailyRate,
            roomStatus: room.roomStatus,
          }
        : emptyForm
    );
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
  }
  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Quartos</h1>
        <button
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
          onClick={() => open_()}
        >
          + Novo
        </button>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full rounded bg-white text-sm shadow">
          <thead className="bg-zinc-100">
            <tr>
              {["Número", "Tipo", "Diária (R$)", "Status", ""].map((h) => (
                <th className="px-4 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr className="border-t" key={r.idRoom}>
                <td className="px-4 py-2">{r.roomNumber}</td>
                <td className="px-4 py-2 capitalize">{r.roomType}</td>
                <td className="px-4 py-2">{r.dailyRate.toFixed(2)}</td>
                <td className="px-4 py-2 capitalize">{r.roomStatus}</td>
                <td className="flex gap-2 px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => open_(r)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => remove.mutate(r.idRoom)}
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
              {editing ? "Editar Quarto" : "Novo Quarto"}
            </h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                Número
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("roomNumber", e.target.value)}
                  value={form.roomNumber}
                />
              </label>
              <label className="text-sm">
                Tipo
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("roomType", e.target.value)}
                  value={form.roomType}
                >
                  <option value="individual">Individual</option>
                  <option value="suite">Suite</option>
                </select>
              </label>
              <label className="text-sm">
                Diária (R$)
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("dailyRate", Number(e.target.value))}
                  type="number"
                  value={form.dailyRate}
                />
              </label>
              <label className="text-sm">
                Status
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) => set("roomStatus", e.target.value)}
                  value={form.roomStatus}
                >
                  <option value="livre">Livre</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="reservado">Reservado</option>
                  <option value="limpando">Limpando</option>
                </select>
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
