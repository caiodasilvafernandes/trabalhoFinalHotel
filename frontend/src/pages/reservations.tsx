import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import { StatusBadge } from "@/components/status-badge";
import {
  guestsApi,
  type Reservation,
  reservationsApi,
  roomsApi,
} from "@/lib/api";
import { type ReservationForm, reservationSchema } from "@/lib/schemas";

export const Route = createFileRoute("/reservations")({
  component: ReservationsPage,
});

const emptyForm: ReservationForm = {
  guestId: "",
  roomId: "",
  checkInDate: "",
  checkOutDate: "",
};

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function ReservationsPage() {
  const qc = useQueryClient();
  const { data: reservations = [], isLoading } = useQuery({
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: emptyForm,
  });

  const guestMap = Object.fromEntries(guests.map((g) => [g.idGuest, g]));
  const roomMap = Object.fromEntries(rooms.map((r) => [r.idRoom, r]));

  const save = useMutation({
    mutationFn: (data: ReservationForm) =>
      editing
        ? reservationsApi.update(editing.idReservation, {
            ...data,
            status: data.status ?? "pendente",
          })
        : reservationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      close_();
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
    reset(
      r
        ? {
            guestId: r.guestId,
            roomId: r.roomId,
            checkInDate: typeof r.checkInDate === "string" ? r.checkInDate : "",
            checkOutDate:
              typeof r.checkOutDate === "string" ? r.checkOutDate : "",
            status: r.status.toLowerCase() as ReservationForm["status"],
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
        <h1 className="font-bold text-2xl text-zinc-900">Reservas</h1>
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
                  "Check-in",
                  "Check-out",
                  "Status",
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
              {reservations.map((r) => (
                <tr
                  className="transition-colors hover:bg-zinc-50"
                  key={r.idReservation}
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {guestMap[r.guestId]?.name ?? r.guestId}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {roomMap[r.roomId]?.roomNumber ?? r.roomId}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {String(r.checkInDate)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {String(r.checkOutDate)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-600"
                        onClick={() => open_(r)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600"
                        onClick={() => remove.mutate(r.idReservation)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal
          onClose={close_}
          title={editing ? "Editar Reserva" : "Nova Reserva"}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => save.mutate(data))}
          >
            <Field error={errors.guestId?.message} label="Hóspede">
              <select {...register("guestId")} className={inputCls}>
                <option value="">Selecione...</option>
                {guests.map((g) => (
                  <option key={g.idGuest} value={g.idGuest}>
                    {g.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field error={errors.roomId?.message} label="Quarto">
              <select {...register("roomId")} className={inputCls}>
                <option value="">Selecione...</option>
                {rooms.map((r) => (
                  <option key={r.idRoom} value={r.idRoom}>
                    {r.roomNumber} — {r.roomType}
                  </option>
                ))}
              </select>
            </Field>
            <Field error={errors.checkInDate?.message} label="Check-in">
              <input
                type="date"
                {...register("checkInDate")}
                className={inputCls}
              />
            </Field>
            <Field error={errors.checkOutDate?.message} label="Check-out">
              <input
                type="date"
                {...register("checkOutDate")}
                className={inputCls}
              />
            </Field>
            {editing && (
              <Field error={errors.status?.message} label="Status">
                <select {...register("status")} className={inputCls}>
                  <option value="pendente">Pendente</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              </Field>
            )}
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
