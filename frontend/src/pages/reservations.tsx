import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
              {["Hospede", "Quarto", "Check-in", "Check-out", "Status", ""].map(
                (h) => (
                  <th className="px-4 py-2 text-left" key={h}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr className="border-t" key={r.idReservation}>
                <td className="px-4 py-2">
                  {guestMap[r.guestId]?.name ?? r.guestId}
                </td>
                <td className="px-4 py-2">
                  {roomMap[r.roomId]?.roomNumber ?? r.roomId}
                </td>
                <td className="px-4 py-2">{String(r.checkInDate)}</td>
                <td className="px-4 py-2">{String(r.checkOutDate)}</td>
                <td className="px-4 py-2 capitalize">
                  {r.status.toLowerCase()}
                </td>
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
            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((data) => save.mutate(data))}
            >
              <Field error={errors.guestId?.message} label="Hospede">
                <select
                  {...register("guestId")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {guests.map((g) => (
                    <option key={g.idGuest} value={g.idGuest}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field error={errors.roomId?.message} label="Quarto">
                <select
                  {...register("roomId")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
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
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </Field>
              <Field error={errors.checkOutDate?.message} label="Check-out">
                <input
                  type="date"
                  {...register("checkOutDate")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </Field>
              {editing && (
                <Field error={errors.status?.message} label="Status">
                  <select
                    {...register("status")}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </Field>
              )}
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
