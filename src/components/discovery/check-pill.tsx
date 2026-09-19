"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A chip that is a checkbox underneath, for the multi-select groups board 05
 * draws as chip rows. `RadioPill` in the UI kit carries the same visual contract
 * but only single-select semantics, and neither kit control shows a facet count.
 */
export function CheckPill({
  label,
  count,
  className,
  title,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; count?: number }) {
  const generated = useId();
  const id = props.id ?? generated;

  return (
    <label
      htmlFor={id}
      title={title}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-sunken)] px-3.5 py-2 text-[0.8125rem] text-[color:var(--text-secondary)] transition-colors",
        "hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]",
        "has-[:checked]:border-[color:var(--text-primary)] has-[:checked]:bg-[color:var(--text-primary)] has-[:checked]:text-[color:var(--surface)]",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--accent)]",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:border-[color:var(--hairline)] has-[:disabled]:bg-transparent has-[:disabled]:text-[color:var(--text-muted)] has-[:disabled]:line-through has-[:disabled]:opacity-60 has-[:disabled]:hover:border-[color:var(--hairline)]",
        className,
      )}
    >
      <input id={id} type="checkbox" className="sr-only" {...props} />
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className="tabular text-[0.6875rem] opacity-60">{count}</span>
      ) : null}
    </label>
  );
}
