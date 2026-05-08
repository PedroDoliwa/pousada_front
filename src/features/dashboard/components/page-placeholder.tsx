export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="px-6 py-8">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

