"use client";

import { useActionState, useId } from "react";
import { Field, TextInput } from "@/components/ui/field";
import type { FormAction } from "./action-state";
import { SubmitButton } from "./action-form";

export function LoginForm({ action, next }: { action: FormAction; next: string }) {
  const [state, formAction] = useActionState(action, null);
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-5" aria-describedby={state ? errorId : undefined}>
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor={emailId} required>
        <TextInput
          id={emailId}
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          maxLength={160}
        />
      </Field>
      <Field label="Password" htmlFor={passwordId} required>
        <TextInput
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
        />
      </Field>
      {state && !state.ok ? (
        <p id={errorId} role="alert" className="text-sm text-signal-danger">
          {state.message}
        </p>
      ) : null}
      <SubmitButton variant="solid" size="lg" full pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
