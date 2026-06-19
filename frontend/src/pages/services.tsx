import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Service, servicesApi } from "@/lib/api";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const emptyForm = { serviceName: "", price: 0 };

function ServicesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () =>
      editing
        ? servicesApi.update(editing.idService, form)
        : servicesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      close();
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
    setForm(s ? { serviceName: s.serviceName, price: s.price } : emptyForm);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
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
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                Nome
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, serviceName: e.target.value }))
                  }
                  value={form.serviceName}
                />
              </label>
              <label className="text-sm">
                Preco (R$)
                <input
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  type="number"
                  value={form.price}
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
