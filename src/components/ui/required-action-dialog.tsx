"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";

type ActionConfig = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type RequiredActionDialogProps = {
  open: boolean;
  icon: LucideIcon;
  iconTone?: "amber" | "blue" | "violet";
  title: string;
  description: string;
  hint?: string;
  primaryAction: ActionConfig;
  secondaryAction?: ActionConfig;
  dismissible?: boolean;
  onClose?: () => void;
};

const ICON_TONE_CLASS: Record<NonNullable<RequiredActionDialogProps["iconTone"]>, string> = {
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
};

function ActionButton({
  action,
  variant,
  buttonRef,
}: {
  action: ActionConfig;
  variant: "primary" | "secondary";
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const className =
    variant === "primary"
      ? "inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      : "inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400";

  if (action.href) {
    return (
      <Link href={action.href} className={className} onClick={action.onClick}>
        {action.label}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      onClick={action.onClick}
    >
      {action.label}
    </button>
  );
}

export function RequiredActionDialog({
  open,
  icon: Icon,
  iconTone = "amber",
  title,
  description,
  hint,
  primaryAction,
  secondaryAction,
  dismissible = false,
  onClose,
}: RequiredActionDialogProps) {
  const titleId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    primaryRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !dismissible) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  function handleBackdropClick() {
    if (dismissible) onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mb-4 inline-flex size-12 items-center justify-center rounded-full ${ICON_TONE_CLASS[iconTone]}`}
        >
          <Icon className="size-6" aria-hidden />
        </div>

        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        {hint ? (
          <p className="mt-3 text-xs text-slate-500">{hint}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <ActionButton
            action={primaryAction}
            variant="primary"
            buttonRef={primaryRef}
          />
          {secondaryAction ? (
            <ActionButton action={secondaryAction} variant="secondary" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
