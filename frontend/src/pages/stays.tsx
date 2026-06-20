import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
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

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
        <h1 className="font-bold text-2xl text-zinc-900">Estadias</h1>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700"
          onClick={() => open_()}
        >
          + Nova
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-zinc-200 border-b bg-zinc-50">
                {[
                  "Hóspede",
                  "Quarto",
                  "Check-in real",
                  "Check-out real",
                  "",
                ].map((h) => (
                  <th
                    className="px-4 py-3 text-left font-semibold text-xs text-zinc-400 uppercase tracking-wider"
                    key={h}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {stays.map((s) => {
                const res = reservationMap[s.reservationId];
                const guest = res ? guestMap[res.guestId] : undefined;
                const room = res ? roomMap[res.roomId] : undefined;
                return (
                  <tr
                    className="transition-colors hover:bg-zinc-50"
                    key={s.idStay}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {guest?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {room?.roomNumber ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {s.actualCheckIn
                        ? new Date(s.actualCheckIn).toLocaleString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {s.actualCheckOut
                        ? new Date(s.actualCheckOut).toLocaleString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-600"
                          onClick={() => open_(s)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600"
                          onClick={() => remove.mutate(s.idStay)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal
          onClose={close_}
          title={editing ? "Editar Estadia" : "Nova Estadia"}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => save.mutate(data))}
          >
            <Field error={errors.reservationId?.message} label="Reserva">
              <select {...register("reservationId")} className={inputCls}>
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
            <Field error={errors.actualCheckIn?.message} label="Check-in real">
              <input
                type="datetime-local"
                {...register("actualCheckIn")}
                className={inputCls}
              />
            </Field>
            <Field
              error={errors.actualCheckOut?.message}
              label="Check-out real (opcional)"
            >
              <input
                type="datetime-local"
                {...register("actualCheckOut")}
                className={inputCls}
              />
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="rounded-lg border border-zinc-200 px-4 py-2 font-medium text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
                onClick={close_}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700"
                type="submit"
              >
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
