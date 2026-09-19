"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, TextInput } from "@/components/ui/field";
import {
  documentRequestSchema,
  type DocumentRequestInput,
  type DocumentRequestValues,
} from "@/lib/validation";
import { FormField } from "./form-field";
import { FormShell, HoneypotField } from "./form-shell";
import { readUtm, useLeadSubmit } from "./submit";

export interface DocumentRequestFormProps {
  projectSlug: string;
  projectName?: string | null;
  documentId: string;
  documentTitle?: string | null;
  onSuccess?: (reference: string) => void;
  compact?: boolean;
  className?: string;
}

/** For a `DocumentRef` with `gated: true`, or one whose file is not uploaded yet. */
export function DocumentRequestForm({
  projectSlug,
  projectName = null,
  documentId,
  documentTitle = null,
  onSuccess,
  compact = true,
  className,
}: DocumentRequestFormProps) {
  const [startedAt] = useState(() => Date.now());
  const consentId = useId();
  const { state, submit } = useLeadSubmit("/api/documents/request");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentRequestInput, unknown, DocumentRequestValues>({
    resolver: zodResolver(documentRequestSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      projectSlug,
      documentId,
      documentTitle: documentTitle ?? "",
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

  const label = documentTitle ?? "this document";

  return (
    <FormShell
      state={state}
      onSubmit={onValid}
      submitLabel="Request Access"
      successTitle="Request received."
      successBody={`A TokenZameen advisor will send ${label} across and answer anything you want to check.`}
      fallbackMessage={[
        `Hi TokenZameen, I would like access to ${label}.`,
        projectName ? `Property: ${projectName}` : null,
        "My name is ____ and my number is ____.",
      ]
        .filter(Boolean)
        .join("\n")}
      compact={compact}
      className={className}
    >
      <HoneypotField {...register("website")} />
      <input type="hidden" {...register("projectSlug")} />
      <input type="hidden" {...register("documentId")} />
      <input type="hidden" {...register("documentTitle")} />

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
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
      </div>

      <FormField
        label="Email"
        required
        error={errors.email?.message}
        hint="We send documents by email"
      >
        {(field) => (
          <TextInput {...field} {...register("email")} type="email" autoComplete="email" />
        )}
      </FormField>

      <div>
        <Checkbox
          id={consentId}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${consentId}-error` : undefined}
          label="I agree to be contacted by a TokenZameen advisor about this request."
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
