"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";
import { Button } from "@/components/ui/button";
import type { LeadSource } from "@/db/schema";

interface RequestValue {
  subject: string | null;
  request: (subject: string, source?: LeadSource) => void;
}

const RequestContext = createContext<RequestValue | null>(null);

/**
 * Every "request" action on the detail page funnels through here, so each one
 * captures a lead against the same property and carries what was asked for into
 * the dialog. `onRequest` lets an integrator take the action over instead.
 */
export function DetailRequestProvider({
  children,
  projectSlug,
  projectName,
  onRequest,
}: {
  children: React.ReactNode;
  projectSlug: string;
  projectName: string;
  onRequest?: (subject: string, source: LeadSource) => void;
}) {
  const [subject, setSubject] = useState<string | null>(null);
  const [source, setSource] = useState<LeadSource>("property-enquiry");
  const [open, setOpen] = useState(false);

  const request = useCallback(
    (nextSubject: string, nextSource: LeadSource = "property-enquiry") => {
      setSubject(nextSubject);
      setSource(nextSource);
      if (onRequest) {
        onRequest(nextSubject, nextSource);
        return;
      }
      setOpen(true);
    },
    [onRequest],
  );

  const value = useMemo<RequestValue>(() => ({ subject, request }), [subject, request]);

  return (
    <RequestContext.Provider value={value}>
      {children}
      <EnquiryDialog
        open={open}
        onClose={() => setOpen(false)}
        projectSlug={projectSlug}
        projectName={projectName}
        source={source}
        title="Request details"
        description={
          subject
            ? `You asked for ${subject}. Leave your details and an advisor will send it — nothing is payable at this step.`
            : undefined
        }
      />
    </RequestContext.Provider>
  );
}

export function useDetailRequest(): RequestValue {
  const context = useContext(RequestContext);
  if (!context) throw new Error("useDetailRequest must be used inside DetailRequestProvider");
  return context;
}

type ButtonVariant = "primary" | "secondary" | "solid" | "glass" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export function RequestButton({
  subject,
  source,
  children,
  variant = "secondary",
  size = "md",
  full = false,
  className,
}: {
  subject: string;
  source?: LeadSource;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
}) {
  const { request } = useDetailRequest();
  return (
    <Button
      variant={variant}
      size={size}
      full={full}
      className={className}
      onClick={() => request(subject, source)}
    >
      {children}
    </Button>
  );
}
