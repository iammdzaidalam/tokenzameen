"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const CONTROL =
  "w-full rounded-xl border border-[color:var(--hairline-strong)] bg-white/[0.03] px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder:text-steel-500 transition-colors focus:border-gold-400/60 focus:bg-white/[0.06] focus:outline-none disabled:opacity-50 aria-[invalid=true]:border-signal-danger/70";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  required,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium tracking-wide text-steel-300">
        {label}
        {required ? <span className="ml-1 text-gold-400">*</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-signal-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-steel-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(CONTROL, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-steel-400"
      />
    </div>
  );
}

export function Checkbox({
  label,
  count,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; count?: number }) {
  const id = useId();
  return (
    <label
      htmlFor={props.id ?? id}
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-steel-300 transition-colors hover:text-bone-100",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <span className="relative grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-[color:var(--hairline-strong)] transition-colors group-has-[:checked]:border-gold-400 group-has-[:checked]:bg-gold-400">
          <input id={props.id ?? id} type="checkbox" className="peer sr-only" {...props} />
          <svg
            viewBox="0 0 12 10"
            aria-hidden
            className="size-2.5 scale-0 text-carbon-950 transition-transform peer-checked:scale-100"
          >
            <path d="M1 5L4.2 8L11 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>{label}</span>
      </span>
      {typeof count === "number" ? (
        <span className="tabular text-xs text-steel-500">{count}</span>
      ) : null}
    </label>
  );
}

export function RadioPill({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <label
      htmlFor={props.id ?? id}
      className={cn(
        "cursor-pointer rounded-full border border-[color:var(--hairline-strong)] px-4 py-2 text-sm text-steel-300 transition-colors has-[:checked]:border-gold-400 has-[:checked]:bg-gold-400/10 has-[:checked]:text-gold-200 hover:text-bone-100",
        className,
      )}
    >
      <input id={props.id ?? id} type="radio" className="sr-only" {...props} />
      {label}
    </label>
  );
}
