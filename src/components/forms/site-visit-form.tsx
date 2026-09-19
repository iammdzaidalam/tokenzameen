"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, Select, TextInput } from "@/components/ui/field";
import {
  MAX_VISIT_LEAD_DAYS,
  VISIT_SLOT_LABEL,
  VISIT_SLOT_VALUES,
  addDaysToIsoDate,
  siteVisitSchema,
  todayInIndia,
  type SiteVisitInput,
  type SiteVisitValues,
} from "@/lib/validation";
import { FormField } from "./form-field";
import { FormShell, HoneypotField } from "./form-shell";
import type { PropertyOption } from "./enquiry-form";
import { readUtm, useLeadSubmit } from "./submit";

/** PRD 01 §29. The wording is fixed copy and must not be paraphrased. */
export const SITE_VISIT_CONFIRMATION =
  "Your site visit request has been received. A TokenZameen advisor will confirm your appointment shortly.";

export interface SiteVisitFormProps {
  projectSlug?: string | null;
  projectName?: string | null;
  /** Pass from a Server Component when no property is pre-selected. */
  properties?: PropertyOption[];
  onSuccess?: (reference: string) => void;
  compact?: boolean;
  className?: string;
}

export function SiteVisitForm({
  projectSlug = null,
  projectName = null,
  properties,
  onSuccess,
  compact = false,
  className,
}: SiteVisitFormProps) {
  const [startedAt] = useState(() => Date.now());
  const consentId = useId();
  const { state, submit } = useLeadSubmit("/api/site-visits");

  const today = todayInIndia();
  const latest = addDaysToIsoDate(today, MAX_VISIT_LEAD_DAYS);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteVisitInput, unknown, SiteVisitValues>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      projectSlug: projectSlug ?? "",
      preferredDate: "",
      preferredTime: "",
      visitors: 1,
      message: "",
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

  const showPicker = !projectSlug && properties && properties.length > 0;

  const fallbackMessage = [
    "Hi TokenZameen, I would like to schedule a site visit.",
    projectName ? `Property: ${projectName}` : null,
    "My name is ____, my number is ____ and I would like to visit on ____.",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <FormShell
      state={state}
      onSubmit={onValid}
      submitLabel="Schedule a Site Visit"
      successTitle="Request received."
      successBody={SITE_VISIT_CONFIRMATION}
      fallbackMessage={fallbackMessage}
      compact={compact}
      className={className}
    >
      <HoneypotField {...register("website")} />
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
        <FormField label="Preferred date" required error={errors.preferredDate?.message}>
          {(field) => (
            <TextInput
              {...field}
              {...register("preferredDate")}
              type="date"
              min={today}
              max={latest}
            />
          )}
        </FormField>

        <FormField label="Preferred time" error={errors.preferredTime?.message}>
          {(field) => (
            <Select {...field} {...register("preferredTime")}>
              <option value="">Any time</option>
              {VISIT_SLOT_VALUES.map((slot) => (
                <option key={slot} value={slot}>
                  {VISIT_SLOT_LABEL[slot]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>

      <FormField label="Number of visitors" error={errors.visitors?.message}>
        {(field) => (
          <TextInput
            {...field}
            {...register("visitors")}
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            className="sm:max-w-40"
          />
        )}
      </FormField>

      <div>
        <Checkbox
          id={consentId}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${consentId}-error` : undefined}
          label="I agree to be contacted by a TokenZameen advisor to confirm this visit."
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
