"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, Select, TextInput } from "@/components/ui/field";
import {
  CALLBACK_WINDOW_LABEL,
  CALLBACK_WINDOW_VALUES,
  callbackSchema,
  type CallbackInput,
  type CallbackValues,
} from "@/lib/validation";
import type { LeadSource } from "@/db/schema";
import { FormField } from "./form-field";
import { FormShell, HoneypotField } from "./form-shell";
import { readUtm, useLeadSubmit } from "./submit";

export interface CallbackFormProps {
  projectSlug?: string | null;
  projectName?: string | null;
  source?: LeadSource;
  onSuccess?: (reference: string) => void;
  className?: string;
}

/** The short form for sticky bars and footers: name, phone, when to call. */
export function CallbackForm({
  projectSlug = null,
  projectName = null,
  source = "callback",
  onSuccess,
  className,
}: CallbackFormProps) {
  const [startedAt] = useState(() => Date.now());
  const consentId = useId();
  const { state, submit } = useLeadSubmit("/api/leads");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CallbackInput, unknown, CallbackValues>({
    resolver: zodResolver(callbackSchema),
    defaultValues: {
      name: "",
      phone: "",
      projectSlug: projectSlug ?? "",
      preferredCallback: "",
      source,
      consent: false,
      website: "",
    },
  });

  useEffect(() => {
    if (state.status === "success") onSuccess?.(state.reference);
  }, [state, onSuccess]);

  const onValid = handleSubmit(async (values) => {
    await submit({ ...values, startedAt, utm: readUtm() });
  });

  return (
    <FormShell
      state={state}
      onSubmit={onValid}
      submitLabel="Request a Callback"
      successTitle="We will call you."
      successBody="A TokenZameen advisor will call you in your chosen window."
      fallbackMessage={[
        "Hi TokenZameen, please call me back.",
        projectName ? `Property: ${projectName}` : null,
        "My name is ____ and my number is ____.",
      ]
        .filter(Boolean)
        .join("\n")}
      compact
      className={className}
    >
      <HoneypotField {...register("website")} />
      <input type="hidden" {...register("source")} />
      {projectSlug ? <input type="hidden" {...register("projectSlug")} /> : null}

      <FormField label="Full name" required error={errors.name?.message}>
        {(field) => <TextInput {...field} {...register("name")} autoComplete="name" />}
      </FormField>

      <FormField label="Phone" required error={errors.phone?.message} hint="10-digit Indian mobile">
        {(field) => (
          <TextInput
            {...field}
            {...register("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
          />
        )}
      </FormField>

      <FormField label="When should we call?" error={errors.preferredCallback?.message}>
        {(field) => (
          <Select {...field} {...register("preferredCallback")}>
            <option value="">Any time</option>
            {CALLBACK_WINDOW_VALUES.map((window) => (
              <option key={window} value={window}>
                {CALLBACK_WINDOW_LABEL[window]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <div>
        <Checkbox
          id={consentId}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${consentId}-error` : undefined}
          label="I agree to be contacted by a TokenZameen advisor."
          {...register("consent")}
        />
        {errors.consent?.message ? (
          <p id={`${consentId}-error`} role="alert" className="mt-1 text-xs text-signal-danger">
            {errors.consent.message}
          </p>
        ) : null}
      </div>
    </FormShell>
  );
}
