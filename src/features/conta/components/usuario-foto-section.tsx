"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteFotoAction,
  uploadFotoAction,
  type FotoActionState,
} from "@/features/conta/actions";
import { UsuarioAvatar } from "@/features/conta/components/usuario-avatar";
import { FOTO_MIME_TYPES } from "@/features/conta/schema";

type Props = {
  nome: string;
  temFoto: boolean;
};

export function UsuarioFotoSection({ nome, temFoto: initialTemFoto }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [temFoto, setTemFoto] = useState(initialTemFoto);
  const [cacheBust, setCacheBust] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const [uploadState, uploadAction, uploadPending] = useActionState<
    FotoActionState,
    FormData
  >(uploadFotoAction, {});

  useEffect(() => {
    setTemFoto(initialTemFoto);
  }, [initialTemFoto]);

  useEffect(() => {
    if (uploadState.error) {
      setFeedback({ type: "error", message: uploadState.error });
    } else if (uploadState.success) {
      setFeedback({ type: "success", message: uploadState.success });
    }
    if (uploadState.temFoto !== undefined) {
      setTemFoto(uploadState.temFoto);
      if (uploadState.temFoto) {
        setCacheBust(Date.now());
        router.refresh();
      }
    }
  }, [uploadState, router]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleRemove() {
    if (!confirm("Remover a foto de perfil?")) return;
    setRemoving(true);
    setFeedback(null);
    try {
      const result = await deleteFotoAction();
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setTemFoto(false);
        setFeedback({
          type: "success",
          message: result.success ?? "Foto removida.",
        });
        router.refresh();
      }
    } finally {
      setRemoving(false);
    }
  }

  const busy = uploadPending || removing;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={busy}
          className="group relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
          aria-label="Alterar foto de perfil"
        >
          <UsuarioAvatar
            nome={nome}
            temFoto={temFoto}
            size="lg"
            cacheBust={cacheBust}
            className="ring-slate-200"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/40">
            <Camera className="size-7 text-white opacity-0 transition group-hover:opacity-100" />
          </span>
        </button>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-slate-900">Foto de perfil</h2>

          <form action={uploadAction} className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <input
              ref={fileInputRef}
              type="file"
              name="arquivo"
              accept={FOTO_MIME_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFeedback(null);
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={openFilePicker}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {uploadPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Camera className="size-4" aria-hidden />
              )}
              Alterar foto
            </button>

            {temFoto ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                {removing ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
                Remover
              </button>
            ) : null}
          </form>
        </div>
      </div>

      {feedback ? (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            feedback.type === "error"
              ? "bg-red-50 text-red-800"
              : "bg-green-50 text-green-800"
          }`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}
