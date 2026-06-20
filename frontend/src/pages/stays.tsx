import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  guestsApi,
  reservationsApi,
  roomsApi,
  type Stay,
  staysApi,
} from "@/lib/api";
import { type StayForm, staySchema } from "@/lib/schemas";

export const Route = createFileRoute("/stays")({ component: StaysPage });

const emptyForm: StayForm = {
  reservationId: "",
  actualCheckIn: "",
  actualCheckOut: "",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm">
      {label}
      {children}
      {error && (
        <span className="mt-0.5 block text-red-500 text-xs">{error}</span>
      )}
    </label>
  );
}

function StaysPage() {
  const qc = useQueryClient();
  const { data: stays = [], isLoading } = useQuery({
    queryKey: ["stays"],
    queryFn: staysApi.list,
  });
  const { data: reservations = [] } = useQuery({
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
  const [editing, setEditing] = useState<Stay | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StayForm>({
    resolver: zodResolver(staySchema),
    defaultValues: emptyForm,
  });

  const guestMap = Object.fromEntries(guests.map((g) => [g.idGuest, g]));
  const roomMap = Object.fromEntries(rooms.map((r) => [r.idRoom, r]));
  const reservationMap = Object.fromEntries(
    reservations.map((r) => [r.idReservation, r])
  );

  const save = useMutation({
    mutationFn: (data: StayForm) => {
      const payload = {
        reservationId: data.reservationId,
        actualCheckIn: data.actualCheckIn,
        ...(data.actualCheckOut ? { actualCheckOut: data.actualCheckOut } : {}),
      };
      return editing
        ? staysApi.update(editing.idStay, payload)
        : staysApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stays"] });
      close_();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => staysApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["stays"] });
      const prev = qc.getQueryData<Stay[]>(["stays"]);
      qc.setQueryData<Stay[]>(["stays"], (old) =>
        old?.filter((s) => s.idStay !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["stays"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["stays"] }),
  });

  function open_(s?: Stay) {
    setEditing(s ?? null);
    reset(
      s
        ? {
            reservationId: s.reservationId,
            actualCheckIn: s.actualCheckIn?.slice(0, 16) ?? "",
            actualCheckOut: s.actualCheckOut?.slice(0, 16) ?? "",
          }
        : emptyForm
    );
    setOpen(true);
  }
  function close_() {
    setOpen(false);
    setEditing(null);
    reset(emptyForm);
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
              {["Hospede", "Quarto", "Check-in real", "Check-out real", ""].map(
                (h) => (
                  <th className="px-4 py-2 text-left" key={h}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {stays.map((s) => {
              const res = reservationMap[s.reservationId];
              const guest = res ? guestMap[res.guestId] : undefined;
              const room = res ? roomMap[res.roomId] : undefined;
              return (
                <tr className="border-t" key={s.idStay}>
                  <td className="px-4 py-2">{guest?.name ?? "-"}</td>
                  <td className="px-4 py-2">{room?.roomNumber ?? "-"}</td>
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
              );
            })}
          </tbody>
        </table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 font-semibold text-lg">
              {editing ? "Editar Estadia" : "Nova Estadia"}
            </h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((data) => save.mutate(data))}
            >
              <Field error={errors.reservationId?.message} label="Reserva">
                <select
                  {...register("reservationId")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {reservations.map((r) => {
                    const g = guestMap[r.guestId];
                    const rm = roomMap[r.roomId];
                    return (
                      <option key={r.idReservation} value={r.idReservation}>
                        {g?.name ?? r.guestId} — {rm?.roomNumber ?? r.roomId} (
                        {String(r.checkInDate)})
                      </option>
                    );
                  })}
                </select>
              </Field>
              <Field
                error={errors.actualCheckIn?.message}
                label="Check-in real"
              >
                <input
                  type="datetime-local"
                  {...register("actualCheckIn")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </Field>
              <Field
                error={errors.actualCheckOut?.message}
                label="Check-out real (opcional)"
              >
                <input
                  type="datetime-local"
                  {...register("actualCheckOut")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </Field>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  className="rounded border px-4 py-2 text-sm"
                  onClick={close_}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
                  type="submit"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
