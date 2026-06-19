import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  type Consumption,
  consumptionsApi,
  servicesApi,
  staysApi,
} from "@/lib/api";

export const Route = createFileRoute("/consumptions")({
  component: ConsumptionsPage,
});

const emptyForm = { stayId: "", serviceId: "", quantity: 1 };

function ConsumptionsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
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
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () =>
      editing
        ? consumptionsApi.update(editing.consumptionId, form)
        : consumptionsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consumptions"] });
      close();
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
    setForm(
      c
        ? {
            stayId: c.stay.idStay,
            serviceId: c.service.idService,
            quantity: c.quantity,
          }
        : emptyForm
    );
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
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
              {["Estadia (hospede)", "Servico", "Qtd", ""].map((h) => (
                <th className="px-4 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr className="border-t" key={c.consumptionId}>
                <td className="px-4 py-2">{c.stay.reservation.guest.name}</td>
                <td className="px-4 py-2">{c.service.serviceName}</td>
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
            ))}
          </tbody>
        </table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 font-semibold text-lg">
              {editing ? "Editar Consumo" : "Novo Consumo"}
            </h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                Estadia
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stayId: e.target.value }))
                  }
                  value={form.stayId}
                >
                  <option value="">Selecione...</option>
                  {stays.map((s) => (
                    <option key={s.idStay} value={s.idStay}>
                      {s.reservation.guest.name} —{" "}
                      {s.reservation.room.roomNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Servico
                <select
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, serviceId: e.target.value }))
                  }
                  value={form.serviceId}
                >
                  <option value="">Selecione...</option>
                  {services.map((s) => (
                    <option key={s.idService} value={s.idService}>
                      {s.serviceName} — R$ {s.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Quantidade
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  min={1}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                  }
                  type="number"
                  value={form.quantity}
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded border px-4 py-2 text-sm"
                onClick={close}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
                onClick={() => save.mutate()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
