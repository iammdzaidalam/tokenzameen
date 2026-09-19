"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Status = "idle" | "pending" | "done" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    setStatus("pending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true }),
      });
      setStatus(response.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
        <Check className="size-4 text-[color:var(--accent)]" />
        You&apos;re on the list. We&apos;ll write when something worth seeing comes in.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex items-stretch">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          className="min-w-0 flex-1 border border-[color:var(--hairline-strong)] bg-transparent px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "pending"}
          aria-label="Subscribe to collection updates"
          className={cn(
            "grid w-12 shrink-0 place-items-center border border-l-0 border-[color:var(--hairline-strong)] bg-[color:var(--text-primary)] text-[color:var(--surface)] transition-opacity",
            status === "pending" && "opacity-60",
          )}
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
      {status === "error" ? (
        <p role="alert" className="text-xs text-signal-danger">
          That didn&apos;t go through. Try again, or email us directly.
        </p>
      ) : null}
    </form>
  );
}
