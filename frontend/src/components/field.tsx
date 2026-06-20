export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </label>
  );
}
