import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import { type Guest, guestsApi } from "@/lib/api";
import { type GuestForm, guestSchema } from "@/lib/schemas";

export const Route = createFileRoute("/guests")({ component: GuestsPage });

const emptyForm: GuestForm = { name: "", cpf: "", phone: "", email: "" };

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function GuestsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: guestsApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
    defaultValues: emptyForm,
  });

  const save = useMutation({
    mutationFn: (data: GuestForm) =>
      editing
        ? guestsApi.update(editing.idGuest, data)
        : guestsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guests"] });
      close_();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => guestsApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["guests"] });
      const prev = qc.getQueryData<Guest[]>(["guests"]);
      qc.setQueryData<Guest[]>(["guests"], (old) =>
        old?.filter((g) => g.idGuest !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["guests"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  });

  function open_(g?: Guest) {
    setEditing(g ?? null);
    reset(
      g
        ? { name: g.name, cpf: g.cpf, phone: g.phone, email: g.email }
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
        <h1 className="font-bold text-2xl text-zinc-900">Hóspedes</h1>
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
                {["Nome", "CPF", "Telefone", "Email", ""].map((h) => (
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
              {data.map((g) => (
                <tr
                  className="transition-colors hover:bg-zinc-50"
                  key={g.idGuest}
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {g.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{g.cpf}</td>
                  <td className="px-4 py-3 text-zinc-600">{g.phone}</td>
                  <td className="px-4 py-3 text-zinc-600">{g.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-600"
                        onClick={() => open_(g)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600"
                        onClick={() => remove.mutate(g.idGuest)}
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
          title={editing ? "Editar Hóspede" : "Novo Hóspede"}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => save.mutate(data))}
          >
            <Field error={errors.name?.message} label="Nome">
              <input {...register("name")} className={inputCls} />
            </Field>
            <Field error={errors.cpf?.message} label="CPF">
              <input {...register("cpf")} className={inputCls} />
            </Field>
            <Field error={errors.phone?.message} label="Telefone">
              <input {...register("phone")} className={inputCls} />
            </Field>
            <Field error={errors.email?.message} label="Email">
              <input {...register("email")} className={inputCls} type="email" />
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
