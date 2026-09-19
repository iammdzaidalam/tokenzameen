"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { FormAction } from "./action-state";

export function ActionForm({
  action,
  children,
  className,
  messageClassName,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  messageClassName?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      {state ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={cn(
            "text-xs",
            state.ok ? "text-signal-success" : "text-signal-danger",
            messageClassName,
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

type ButtonVariant = "primary" | "secondary" | "solid" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "solid",
  size = "sm",
  name,
  value,
  confirm,
  className,
  full,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  name?: string;
  value?: string;
  /** Asks before submitting. Used only for actions that are not easily reversed. */
  confirm?: string;
  className?: string;
  full?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      name={name}
      value={value}
      full={full}
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
