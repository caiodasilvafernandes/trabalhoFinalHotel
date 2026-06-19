import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Guest, guestsApi } from "@/lib/api";

export const Route = createFileRoute("/guests")({ component: GuestsPage });

const emptyForm = { name: "", cpf: "", phone: "", email: "" };

function GuestsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: guestsApi.list,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () =>
      editing
        ? guestsApi.update(editing.idGuest, form)
        : guestsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guests"] });
      close();
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
    setForm(
      g
        ? { name: g.name, cpf: g.cpf, phone: g.phone, email: g.email }
        : emptyForm
    );
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
  }
  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Hóspedes</h1>
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
              {["Nome", "CPF", "Telefone", "Email", ""].map((h) => (
                <th className="px-4 py-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((g) => (
              <tr className="border-t" key={g.idGuest}>
                <td className="px-4 py-2">{g.name}</td>
                <td className="px-4 py-2">{g.cpf}</td>
                <td className="px-4 py-2">{g.phone}</td>
                <td className="px-4 py-2">{g.email}</td>
                <td className="flex gap-2 px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => open_(g)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => remove.mutate(g.idGuest)}
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
              {editing ? "Editar Hóspede" : "Novo Hóspede"}
            </h2>
            <div className="flex flex-col gap-3">
              {(["name", "cpf", "phone", "email"] as const).map((k) => (
                <label className="text-sm capitalize" key={k}>
                  {k === "name"
                    ? "Nome"
                    : k === "phone"
                      ? "Telefone"
                      : k.toUpperCase()}
                  <input
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                    onChange={(e) => set(k, e.target.value)}
                    value={form[k]}
                  />
                </label>
              ))}
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
