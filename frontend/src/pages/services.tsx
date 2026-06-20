import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { type Service, servicesApi } from "@/lib/api";
import { type ServiceForm, serviceSchema } from "@/lib/schemas";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const emptyForm: ServiceForm = { serviceName: "", price: 0 };

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
        <h1 className="font-bold text-2xl">Servicos</h1>
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
              {["Nome", "Preco (R$)", ""].map((h) => (
                <th className="px-4 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr className="border-t" key={s.idService}>
                <td className="px-4 py-2">{s.serviceName}</td>
                <td className="px-4 py-2">{s.price.toFixed(2)}</td>
                <td className="flex gap-2 px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => open_(s)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => remove.mutate(s.idService)}
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
              {editing ? "Editar Servico" : "Novo Servico"}
            </h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((data) => save.mutate(data))}
            >
              <Field error={errors.serviceName?.message} label="Nome">
                <input
                  {...register("serviceName")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </Field>
              <Field error={errors.price?.message} label="Preco (R$)">
                <Controller
                  control={control}
                  name="price"
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
