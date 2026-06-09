"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Pousada } from "@/types/entities";

type Props = {
  pousadas: Pousada[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function PousadaSelector({ pousadas, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = pousadas.find((p) => p.id === selectedId) ?? pousadas[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!selected) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group -ml-1 flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-left transition hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Selecionar pousada ativa"
      >
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {selected.nome}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-slate-400 transition group-hover:text-slate-600 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Pousadas"
          className="absolute left-0 top-full z-50 mt-2 min-w-[min(100%,280px)] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
        >
          {pousadas.map((p) => {
            const active = p.id === selectedId;
            return (
              <li key={p.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 truncate">
                    {p.nome}
                    {p.ativa === false ? (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        inativa
                      </span>
                    ) : null}
                  </span>
                  {active ? (
                    <Check className="size-4 shrink-0 text-blue-600" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
