"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, RadioPill, Select, TextArea, TextInput } from "@/components/ui/field";
import {
  BUDGET_BANDS,
  BUDGET_BAND_VALUES,
  CALLBACK_WINDOW_LABEL,
  CALLBACK_WINDOW_VALUES,
  PURPOSE_VALUES,
  enquirySchema,
  type EnquiryInput,
  type EnquiryValues,
} from "@/lib/validation";
import type { CategorySlug } from "@/types/catalog";
import type { LeadSource } from "@/db/schema";
import { FieldSet, FormField } from "./form-field";
import { FormShell, HoneypotField } from "./form-shell";
import { readUtm, useLeadSubmit } from "./submit";

const PURPOSE_LABELS: Record<(typeof PURPOSE_VALUES)[number], string> = {
  "self-use": "Self use",
  investment: "Investment",
  "second-home": "Second home",
  "rental-income": "Rental income",
  "capital-appreciation": "Capital appreciation",
  "commercial-income": "Commercial income",
  "land-banking": "Land banking",
};

export interface PropertyOption {
  slug: string;
  name: string;
}

export interface EnquiryFormProps {
  /** Pre-selects the property and hides the picker. */
  projectSlug?: string | null;
  projectName?: string | null;
  categorySlug?: CategorySlug | null;
  /** Which CTA this form is standing behind. PRD 01 §30. */
  source?: LeadSource;
  /**
   * Pass from a Server Component (`getAllProjects()`), so the catalog is not
   * pulled into the client bundle. Omitted, the picker is not rendered.
   */
  properties?: PropertyOption[];
  onSuccess?: (reference: string) => void;
  compact?: boolean;
  className?: string;
}

export function EnquiryForm({
  projectSlug = null,
  projectName = null,
  categorySlug = null,
  source = "property-enquiry",
  properties,
  onSuccess,
  compact = false,
  className,
}: EnquiryFormProps) {
  const [startedAt] = useState(() => Date.now());
  const consentId = useId();
  const { state, submit } = useLeadSubmit("/api/leads");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      projectSlug: projectSlug ?? "",
      categorySlug: categorySlug ?? "",
      budgetBand: "",
      purpose: "",
      preferredCallback: "",
      message: "",
      source,
      consent: false,
      website: "",
    },
  });

  useEffect(() => {
    if (state.status === "success") onSuccess?.(state.reference);
  }, [state, onSuccess]);

  const showPicker = !projectSlug && properties && properties.length > 0;

  const onValid = handleSubmit(async (values) => {
    await submit({ ...values, startedAt, utm: readUtm() });
  });

  const fallbackMessage = [
    "Hi TokenZameen, I would like to speak to an advisor.",
    projectName ? `Property: ${projectName}` : null,
    "My name is ____ and my number is ____.",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <FormShell
      state={state}
      onSubmit={onValid}
      submitLabel="Express Interest"
      successTitle="Your enquiry is with us."
      successBody="A TokenZameen property advisor will call you to understand your requirement and take it from there."
      fallbackMessage={fallbackMessage}
      compact={compact}
      className={className}
    >
      <HoneypotField {...register("website")} />
      <input type="hidden" {...register("source")} />
      <input type="hidden" {...register("categorySlug")} />
      {projectSlug ? <input type="hidden" {...register("projectSlug")} /> : null}

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

      <FormField label="Email" error={errors.email?.message}>
        {(field) => (
          <TextInput {...field} {...register("email")} type="email" autoComplete="email" />
        )}
      </FormField>

      {projectName && projectSlug ? (
        <div className="rounded-xl border border-[color:var(--hairline)] bg-white/[0.02] px-4 py-3">
          <p className="text-xs tracking-wide text-steel-500">Property</p>
          <p className="mt-0.5 text-sm text-bone-100">{projectName}</p>
        </div>
      ) : showPicker ? (
        <FormField label="Property" error={errors.projectSlug?.message}>
          {(field) => (
            <Select {...field} {...register("projectSlug")}>
              <option value="">Not decided yet</option>
              {properties.map((property) => (
                <option key={property.slug} value={property.slug}>
                  {property.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      ) : null}

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <FormField label="Budget" error={errors.budgetBand?.message}>
          {(field) => (
            <Select {...field} {...register("budgetBand")}>
              <option value="">Prefer not to say</option>
              {BUDGET_BAND_VALUES.map((band) => (
                <option key={band} value={band}>
                  {BUDGET_BANDS[band].label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Purpose" error={errors.purpose?.message}>
          {(field) => (
            <Select {...field} {...register("purpose")}>
              <option value="">Not sure yet</option>
              {PURPOSE_VALUES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {PURPOSE_LABELS[purpose]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>

      <FieldSet legend="Preferred callback time" error={errors.preferredCallback?.message}>
        {CALLBACK_WINDOW_VALUES.map((window) => (
          <RadioPill
            key={window}
            value={window}
            label={CALLBACK_WINDOW_LABEL[window]}
            {...register("preferredCallback")}
          />
        ))}
      </FieldSet>

      <FormField label="Anything we should know?" error={errors.message?.message}>
        {(field) => (
          <TextArea
            {...field}
            {...register("message")}
            rows={3}
            placeholder="Configuration, timeline, questions…"
          />
        )}
      </FormField>

      <div>
        <Checkbox
          id={consentId}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${consentId}-error` : undefined}
          label="I agree to be contacted by a TokenZameen advisor about this enquiry."
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
