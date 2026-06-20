import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import {
  type Consumption,
  consumptionsApi,
  servicesApi,
  staysApi,
} from "@/lib/api";
import { type ConsumptionForm, consumptionSchema } from "@/lib/schemas";

export const Route = createFileRoute("/consumptions")({
  component: ConsumptionsPage,
});

const emptyForm: ConsumptionForm = { stayId: "", serviceId: "", quantity: 1 };

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

function ConsumptionsPage() {
  const qc = useQueryClient();
  const { data: consumptions = [], isLoading } = useQuery({
    queryKey: ["consumptions"],
    queryFn: consumptionsApi.list,
  });
  const { data: stays = [] } = useQuery({
    queryKey: ["stays"],
    queryFn: staysApi.list,
  });
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Consumption | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ConsumptionForm>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: emptyForm,
  });

  // join local
  const stayMap = Object.fromEntries(stays.map((s) => [s.idStay, s]));
  const serviceMap = Object.fromEntries(services.map((s) => [s.idService, s]));

  const save = useMutation({
    mutationFn: (data: ConsumptionForm) =>
      editing
        ? consumptionsApi.update(editing.consumptionId, data)
        : consumptionsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consumptions"] });
      close_();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => consumptionsApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["consumptions"] });
      const prev = qc.getQueryData<Consumption[]>(["consumptions"]);
      qc.setQueryData<Consumption[]>(["consumptions"], (old) =>
        old?.filter((c) => c.consumptionId !== id)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["consumptions"], ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["consumptions"] }),
  });

  function open_(c?: Consumption) {
    setEditing(c ?? null);
    reset(
      c
        ? { stayId: c.stayId, serviceId: c.serviceId, quantity: c.quantity }
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
        <h1 className="font-bold text-2xl">Consumos</h1>
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
              {["Estadia", "Servico", "Qtd", ""].map((h) => (
                <th className="px-4 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consumptions.map((c) => {
              const stay = stayMap[c.stayId];
              const service = serviceMap[c.serviceId];
              return (
                <tr className="border-t" key={c.consumptionId}>
                  <td className="px-4 py-2">
                    {stay?.reservationId ?? c.stayId}
                  </td>
                  <td className="px-4 py-2">
                    {service?.serviceName ?? c.serviceId}
                  </td>
                  <td className="px-4 py-2">{c.quantity}</td>
                  <td className="flex gap-2 px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => open_(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => remove.mutate(c.consumptionId)}
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
              {editing ? "Editar Consumo" : "Novo Consumo"}
            </h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((data) => save.mutate(data))}
            >
              <Field error={errors.stayId?.message} label="Estadia">
                <select
                  {...register("stayId")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {stays.map((s) => (
                    <option key={s.idStay} value={s.idStay}>
                      {s.reservationId}
                    </option>
                  ))}
                </select>
              </Field>
              <Field error={errors.serviceId?.message} label="Servico">
                <select
                  {...register("serviceId")}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {services.map((s) => (
                    <option key={s.idService} value={s.idService}>
                      {s.serviceName} — R$ {s.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field error={errors.quantity?.message} label="Quantidade">
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, onBlur, name, value } }) => (
                    <NumericFormat
                      allowNegative={false}
                      className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                      decimalScale={0}
                      name={name}
                      onBlur={onBlur}
                      onValueChange={(v) => onChange(v.floatValue ?? 1)}
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
