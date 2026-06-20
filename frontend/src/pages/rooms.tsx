import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { type Room, roomsApi } from "@/lib/api";
import { type RoomForm, roomSchema } from "@/lib/schemas";

export const Route = createFileRoute("/rooms")({ component: RoomsPage });

const emptyForm: RoomForm = {
  roomNumber: "",
  roomType: "individual",
  dailyRate: 0,
  roomStatus: "livre",
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

function RoomsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: emptyForm,
  });

  const save = useMutation({
    mutationFn: (data: RoomForm) =>
      editing ? roomsApi.update(editing.idRoom, data) : roomsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      close_();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["rooms"] });
      const prev = qc.getQueryData<Room[]>(["rooms"]);
      qc.setQueryData<Room[]>(["rooms"], (old) =>
        old?.filter((r) => r.idRoom !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["rooms"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });

  function open_(r?: Room) {
    setEditing(r ?? null);
    reset(
      r
        ? {
            roomNumber: r.roomNumber,
            roomType: r.roomType.toLowerCase() as RoomForm["roomType"],
            dailyRate: r.dailyRate,
            roomStatus: r.roomStatus.toLowerCase() as RoomForm["roomStatus"],
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
              {["Numero", "Tipo", "Diaria (R$)", "Status", ""].map((h) => (
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
            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((data) => save.mutate(data))}
            >
              <Field error={errors.roomNumber?.message} label="Numero">
                <input
                  {...register("roomNumber")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </Field>
              <Field error={errors.roomType?.message} label="Tipo">
                <select
                  {...register("roomType")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
                  <option value="individual">Individual</option>
                  <option value="suite">Suite</option>
                </select>
              </Field>
              <Field error={errors.dailyRate?.message} label="Diaria (R$)">
                <Controller
                  control={control}
                  name="dailyRate"
                  render={({ field: { onChange, onBlur, name, value } }) => (
                    <NumericFormat
                      className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                      decimalScale={2}
                      decimalSeparator=","
                      name={name}
                      onBlur={onBlur}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      prefix="R$ "
                      thousandSeparator="."
                      value={value}
                    />
                  )}
                />
              </Field>
              <Field error={errors.roomStatus?.message} label="Status">
                <select
                  {...register("roomStatus")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
                  <option value="livre">Livre</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="reservado">Reservado</option>
                  <option value="limpando">Limpando</option>
                </select>
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
