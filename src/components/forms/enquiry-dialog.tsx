"use client";

import { useCallback, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/ui/overlay";
import { useMediaQuery } from "@/lib/hooks";
import { EnquiryForm, type EnquiryFormProps } from "./enquiry-form";

export interface EnquiryDialogProps extends EnquiryFormProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * The enquiry form in the shared `Overlay`, for CTAs anywhere on the site.
 *
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <Button onClick={() => setOpen(true)}>Express Interest</Button>
 * <EnquiryDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   projectSlug={project.slug}
 *   projectName={project.name}
 *   source="property-enquiry"
 * />
 * ```
 *
 * The overlay stays open after a successful submission so the buyer can read
 * their reference code; closing is always their decision. For a button that
 * owns its own state, use `EnquiryCta`.
 */
export function EnquiryDialog({
  open,
  onClose,
  title = "Express Interest",
  description = "Tell us how to reach you. A property advisor takes it from there — no payment at this step.",
  ...formProps
}: EnquiryDialogProps) {
  const compactViewport = useMediaQuery("(max-width: 640px)");
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      placement={compactViewport ? "bottom" : "center"}
      labelledBy={titleId}
    >
      <div className="px-6 py-6">
        <EnquiryForm {...formProps} compact={compactViewport} />
      </div>
    </Overlay>
  );
}

export interface EnquiryCtaProps extends EnquiryFormProps {
  label?: string;
  variant?: "primary" | "secondary" | "solid" | "glass" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  buttonClassName?: string;
  title?: string;
  description?: string;
}

/** A button that opens `EnquiryDialog` and manages the open state itself. */
export function EnquiryCta({
  label = "Express Interest",
  variant = "primary",
  size = "md",
  full = false,
  buttonClassName,
  title,
  description,
  ...formProps
}: EnquiryCtaProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        full={full}
        className={buttonClassName}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <EnquiryDialog
        open={open}
        onClose={close}
        title={title}
        description={description}
        {...formProps}
      />
    </>
  );
}
