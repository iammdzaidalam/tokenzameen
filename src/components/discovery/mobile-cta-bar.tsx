"use client";

import { MessageCircle, Phone } from "lucide-react";
import { callHref, enquiryHref, whatsAppHref } from "@/components/discovery/advisory";
import { Button } from "@/components/ui/button";

export function MobileCtaBar() {
  return (
    <div className="border-t border-[color:var(--hairline)] bg-[color:var(--surface-raised)] px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <Button href={enquiryHref()} size="sm" className="flex-1 px-2 text-xs">
          Enquire
        </Button>
        <Button
          href={callHref()}
          variant="secondary"
          size="sm"
          className="flex-1 px-2 text-xs"
          aria-label="Call a TokenZameen advisor"
        >
          <Phone className="size-4" />
          Call
        </Button>
        <Button
          href={whatsAppHref()}
          variant="secondary"
          size="sm"
          className="flex-1 px-2 text-xs"
          aria-label="Message a TokenZameen advisor on WhatsApp"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
