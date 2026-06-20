const config: Record<string, string> = {
  livre: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ocupado: "bg-red-50 text-red-700 border border-red-200",
  reservado: "bg-amber-50 text-amber-700 border border-amber-200",
  limpando: "bg-sky-50 text-sky-700 border border-sky-200",
  pendente: "bg-amber-50 text-amber-700 border border-amber-200",
  encerrado: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

export function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase();
  const cls = config[key] ?? "bg-zinc-100 text-zinc-500 border border-zinc-200";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 font-medium text-xs capitalize ${cls}`}
    >
      {key}
    </span>
  );
}
