import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
import { type Service, servicesApi } from "@/lib/api";
import { type ServiceForm, serviceSchema } from "@/lib/schemas";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const emptyForm: ServiceForm = { serviceName: "", price: 0 };

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function ServicesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: emptyForm,
  });

  const save = useMutation({
    mutationFn: (data: ServiceForm) =>
      editing
        ? servicesApi.update(editing.idService, data)
        : servicesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      close_();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["services"] });
      const prev = qc.getQueryData<Service[]>(["services"]);
      qc.setQueryData<Service[]>(["services"], (old) =>
        old?.filter((s) => s.idService !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["services"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });

  function open_(s?: Service) {
    setEditing(s ?? null);
    reset(s ? { serviceName: s.serviceName, price: s.price } : emptyForm);
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
        <h1 className="font-bold text-2xl text-zinc-900">Serviços</h1>
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
                {["Nome", "Preço", ""].map((h) => (
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
              {data.map((s) => (
                <tr
                  className="transition-colors hover:bg-zinc-50"
                  key={s.idService}
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {s.serviceName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    R$ {s.price.toFixed(2)}
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
                        onClick={() => remove.mutate(s.idService)}
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
          title={editing ? "Editar Serviço" : "Novo Serviço"}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => save.mutate(data))}
          >
            <Field error={errors.serviceName?.message} label="Nome">
              <input {...register("serviceName")} className={inputCls} />
            </Field>
            <Field error={errors.price?.message} label="Preço (R$)">
              <Controller
                control={control}
                name="price"
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
