"use client";

import { useId } from "react";
import { Field } from "@/components/ui/field";

export interface ControlProps {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
}

/**
 * Wires the shared `Field` to an accessible error: the message gets an id and
 * the control points at it. `Field`'s own `error` prop is left unused because it
 * renders the message without an id to reference.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: ControlProps) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <Field
      label={label}
      htmlFor={id}
      required={required}
      hint={error ? undefined : hint}
      className={className}
    >
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : hint ? hintId : undefined,
      })}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-signal-danger">
          {error}
        </p>
      ) : hint ? (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      ) : null}
    </Field>
  );
}

/**
 * A radio or checkbox group is labelled by its legend, not by a `label` element,
 * so it cannot use `FormField`.
 */
export function FieldSet({
  legend,
  error,
  required,
  children,
  className,
}: {
  legend: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <fieldset
      className={className}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="text-xs font-medium tracking-wide text-steel-300">
        {legend}
        {required ? <span className="ml-1 text-gold-400">*</span> : null}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-signal-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
