"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { SITE } from "@/content/config";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <Section space="xl" tone="darker">
      <Container width="narrow" className="text-center">
        <Eyebrow className="justify-center">Something went wrong</Eyebrow>
        <h1 className="mt-6 text-display-lg">We couldn&apos;t load this page.</h1>
        <p className="mt-5 text-base leading-relaxed text-steel-300">
          The fault is on our side. Try again, and if it keeps happening an advisor can
          send you what you were looking for directly.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/purchase" variant="secondary">
            Back to Purchase
          </Button>
          {SITE.advisorPhone ? (
            <Button href={`tel:${SITE.advisorPhone}`} variant="ghost">
              Call an advisor
            </Button>
          ) : null}
        </div>
        {error.digest ? (
          <p className="mt-8 text-xs text-steel-600">Reference: {error.digest}</p>
        ) : null}
      </Container>
    </Section>
  );
}
