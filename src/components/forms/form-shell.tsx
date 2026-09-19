"use client";

import { useId, useState } from "react";
import { Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/content/config";
import { cn } from "@/lib/cn";
import type { SubmitState } from "./submit";

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function CopyMessage({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard
          ?.writeText(message)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2400);
          })
          .catch(() => undefined);
      }}
      className="inline-flex items-center gap-2 text-xs text-[color:var(--text-secondary)] underline-offset-4 transition-colors hover:text-[color:var(--accent)] hover:underline"
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {copied ? "Message copied" : "Copy this message"}
    </button>
  );
}

/**
 * The failure path. A submission that did not reach TokenZameen must leave the
 * buyer with a way to reach an advisor that does not depend on this form, and
 * with the message already written for them.
 */
export function AdvisorFallback({ message, headline }: { message: string; headline?: string }) {
  const phone = SITE.advisorPhone;
  const whatsapp = digitsOnly(SITE.advisorWhatsApp);
  const email = SITE.advisorEmail;
  const hasChannel = Boolean(phone || whatsapp || email);

  return (
    <div
      role="alert"
      className="rounded-card border border-signal-danger/40 bg-signal-danger/[0.07] p-5"
    >
      <p className="text-sm font-medium text-[color:var(--text-primary)]">
        {headline ?? "Your enquiry was not sent."}
      </p>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
        Nothing has been recorded at our end. Please reach an advisor directly — it is the fastest
        way from here.
      </p>

      {hasChannel ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {phone ? (
            <Button href={`tel:${phone}`} variant="secondary" size="sm">
              <Phone className="size-4" aria-hidden />
              {phone}
            </Button>
          ) : null}
          {whatsapp ? (
            <Button
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </Button>
          ) : null}
          {email ? (
            <Button
              href={`mailto:${email}?subject=${encodeURIComponent("TokenZameen enquiry")}&body=${encodeURIComponent(message)}`}
              variant="secondary"
              size="sm"
            >
              <Mail className="size-4" aria-hidden />
              {email}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-[color:var(--hairline)] bg-[color:var(--surface-sunken)] p-3">
        <p className="text-xs uppercase tracking-wide text-[color:var(--text-muted)]">Message to send</p>
        <p className="mt-1 whitespace-pre-line text-sm text-[color:var(--text-primary)]">{message}</p>
        <div className="mt-2">
          <CopyMessage message={message} />
        </div>
      </div>
    </div>
  );
}

export function FormSuccess({
  title,
  body,
  reference,
}: {
  title: string;
  body: string;
  reference: string;
}) {
  return (
    <div className="rounded-card border border-signal-success/40 bg-signal-success/[0.07] p-6">
      <p className="text-display-sm text-[color:var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{body}</p>
      <div className="mt-5 rounded-lg border border-[color:var(--hairline-strong)] bg-[color:var(--surface-sunken)] px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-[color:var(--text-muted)]">Your reference</p>
        <p className="tabular mt-1 text-lg tracking-[0.2em] text-[color:var(--accent)]">{reference}</p>
      </div>
      <p className="mt-3 text-xs text-[color:var(--text-muted)]">
        Keep this reference. You can quote it to an advisor to pick up where you left off.
      </p>
    </div>
  );
}

/**
 * Every form on the site renders through this. Pending, success and failure are
 * handled in one place so no CTA can accidentally show a green tick for a
 * submission that never landed.
 */
export function FormShell({
  state,
  onSubmit,
  submitLabel,
  pendingLabel = "Sending…",
  successTitle,
  successBody,
  fallbackMessage,
  children,
  footer,
  className,
  compact = false,
}: {
  state: SubmitState;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  pendingLabel?: string;
  successTitle: string;
  successBody: string;
  fallbackMessage: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  if (state.status === "success") {
    return (
      <div aria-live="polite">
        <FormSuccess title={successTitle} body={successBody} reference={state.reference} />
      </div>
    );
  }

  const pending = state.status === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className={cn(compact ? "space-y-4" : "space-y-5", className)}>
      {children}

      {state.status === "failure" ? (
        <div aria-live="assertive">
          <AdvisorFallback message={fallbackMessage} headline={state.message} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button type="submit" size={compact ? "md" : "lg"} full disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  );
}

/** Rendered inside every form; a real user never sees, tabs to or fills it. */
export function HoneypotField(props: React.ComponentPropsWithRef<"input">) {
  const id = useId();
  return (
    <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor={id}>Website</label>
      <input id={id} type="text" tabIndex={-1} autoComplete="off" {...props} />
    </div>
  );
}
