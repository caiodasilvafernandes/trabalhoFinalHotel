import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Field } from "@/components/field";
import { Modal } from "@/components/modal";
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

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
        <h1 className="font-bold text-2xl text-zinc-900">Consumos</h1>
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
                {["Estadia", "Serviço", "Qtd", ""].map((h) => (
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
              {consumptions.map((c) => {
                const stay = stayMap[c.stayId];
                const service = serviceMap[c.serviceId];
                return (
                  <tr
                    className="transition-colors hover:bg-zinc-50"
                    key={c.consumptionId}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {stay?.reservationId ?? c.stayId}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {service?.serviceName ?? c.serviceId}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{c.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-600"
                          onClick={() => open_(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-zinc-200 px-2.5 py-1 font-medium text-xs text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600"
                          onClick={() => remove.mutate(c.consumptionId)}
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
          title={editing ? "Editar Consumo" : "Novo Consumo"}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => save.mutate(data))}
          >
            <Field error={errors.stayId?.message} label="Estadia">
              <select {...register("stayId")} className={inputCls}>
                <option value="">Selecione...</option>
                {stays.map((s) => (
                  <option key={s.idStay} value={s.idStay}>
                    {s.reservationId}
                  </option>
                ))}
              </select>
            </Field>
            <Field error={errors.serviceId?.message} label="Serviço">
              <select {...register("serviceId")} className={inputCls}>
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
                    className={inputCls}
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
