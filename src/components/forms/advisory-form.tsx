"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, Select, TextArea, TextInput } from "@/components/ui/field";
import {
  BUDGET_BANDS,
  BUDGET_BAND_VALUES,
  CATEGORY_SLUG_VALUES,
  PURPOSE_VALUES,
  TIMELINE_LABEL,
  TIMELINE_VALUES,
  advisorySchema,
  type AdvisoryInput,
  type AdvisoryValues,
} from "@/lib/validation";
import { FormField } from "./form-field";
import { FormShell, HoneypotField } from "./form-shell";
import { readUtm, useLeadSubmit } from "./submit";

const CATEGORY_LABELS: Record<(typeof CATEGORY_SLUG_VALUES)[number], string> = {
  apartments: "Apartments",
  villas: "Villas",
  commercial: "Commercial Spaces",
  "sustainable-living": "Sustainable Living",
  "spiritual-residences": "Spiritual Residences",
  plots: "Plots",
};

const PURPOSE_LABELS: Record<(typeof PURPOSE_VALUES)[number], string> = {
  "self-use": "Self use",
  investment: "Investment",
  "second-home": "Second home",
  "rental-income": "Rental income",
  "capital-appreciation": "Capital appreciation",
  "commercial-income": "Commercial income",
  "land-banking": "Land banking",
};

export interface AdvisoryFormProps {
  onSuccess?: (reference: string) => void;
  compact?: boolean;
  className?: string;
}

/** PRD 02 §21 — budget, location, property type, purpose, timeline, contact. */
export function AdvisoryForm({ onSuccess, compact = false, className }: AdvisoryFormProps) {
  const [startedAt] = useState(() => Date.now());
  const consentId = useId();
  const { state, submit } = useLeadSubmit("/api/leads");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdvisoryInput, unknown, AdvisoryValues>({
    resolver: zodResolver(advisorySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      budgetBand: "",
      location: "",
      categorySlug: "",
      purpose: "",
      timeline: "",
      message: "",
      consent: false,
      website: "",
    },
  });

  useEffect(() => {
    if (state.status === "success") onSuccess?.(state.reference);
  }, [state, onSuccess]);

  const onValid = handleSubmit(async (values) => {
    await submit({
      ...values,
      source: "advisory",
      startedAt,
      utm: readUtm(),
    });
  });

  return (
    <FormShell
      state={state}
      onSubmit={onValid}
      submitLabel="Talk to an Advisor"
      successTitle="We have your requirement."
      successBody="A TokenZameen advisor will call you to talk through the options that fit what you described."
      fallbackMessage={
        "Hi TokenZameen, I would like help finding a property.\nMy name is ____ and my number is ____."
      }
      compact={compact}
      className={className}
    >
      <HoneypotField {...register("website")} />

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <FormField label="Budget" error={errors.budgetBand?.message}>
          {(field) => (
            <Select {...field} {...register("budgetBand")}>
              <option value="">Not sure yet</option>
              {BUDGET_BAND_VALUES.map((band) => (
                <option key={band} value={band}>
                  {BUDGET_BANDS[band].label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Location" error={errors.location?.message} hint="City or area">
          {(field) => (
            <TextInput {...field} {...register("location")} placeholder="Delhi, Goa, Haridwar…" />
          )}
        </FormField>

        <FormField label="Property type" error={errors.categorySlug?.message}>
          {(field) => (
            <Select {...field} {...register("categorySlug")}>
              <option value="">Open to suggestions</option>
              {CATEGORY_SLUG_VALUES.map((slug) => (
                <option key={slug} value={slug}>
                  {CATEGORY_LABELS[slug]}
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

        <FormField label="Timeline" error={errors.timeline?.message}>
          {(field) => (
            <Select {...field} {...register("timeline")}>
              <option value="">Not decided</option>
              {TIMELINE_VALUES.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {TIMELINE_LABEL[timeline]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>

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

      <FormField label="What are you looking for?" error={errors.message?.message}>
        {(field) => (
          <TextArea
            {...field}
            {...register("message")}
            rows={3}
            placeholder="Tell us anything that would help an advisor shortlist for you."
          />
        )}
      </FormField>

      <div>
        <Checkbox
          id={consentId}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${consentId}-error` : undefined}
          label="I agree to be contacted by a TokenZameen advisor about this requirement."
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
