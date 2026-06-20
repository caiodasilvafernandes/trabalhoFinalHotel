import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import { StatusBadge } from "@/components/status-badge";
import { type Room, roomsApi } from "@/lib/api";
import { type RoomForm, roomSchema } from "@/lib/schemas";

export const Route = createFileRoute("/rooms")({ component: RoomsPage });

const emptyForm: RoomForm = {
  roomNumber: "",
  roomType: "individual",
  dailyRate: 0,
  roomStatus: "livre",
};

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
        <h1 className="font-bold text-2xl text-zinc-900">Quartos</h1>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700"
          onClick={() => open_()}
        >
          + Novo
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-zinc-200 border-b bg-zinc-50">
                {["Número", "Tipo", "Diária", "Status", ""].map((h) => (
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
              {data.map((r) => (
                <tr
                  className="transition-colors hover:bg-zinc-50"
                  key={r.idRoom}
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {r.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 capitalize">
                    {r.roomType.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    R$ {r.dailyRate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={r.roomStatus} />
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
                        onClick={() => remove.mutate(r.idRoom)}
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
          title={editing ? "Editar Quarto" : "Novo Quarto"}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => save.mutate(data))}
          >
            <Field error={errors.roomNumber?.message} label="Número">
              <input {...register("roomNumber")} className={inputCls} />
            </Field>
            <Field error={errors.roomType?.message} label="Tipo">
              <select {...register("roomType")} className={inputCls}>
                <option value="individual">Individual</option>
                <option value="suite">Suite</option>
              </select>
            </Field>
            <Field error={errors.dailyRate?.message} label="Diária (R$)">
              <Controller
                control={control}
                name="dailyRate"
                render={({ field: { onChange, onBlur, name, value } }) => (
                  <NumericFormat
                    className={inputCls}
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
              <select {...register("roomStatus")} className={inputCls}>
                <option value="livre">Livre</option>
                <option value="ocupado">Ocupado</option>
                <option value="reservado">Reservado</option>
                <option value="limpando">Limpando</option>
              </select>
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
