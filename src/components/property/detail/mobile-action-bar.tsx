"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, Send } from "lucide-react";
import { useDetailRequest } from "@/components/property/detail/request-context";
import { SITE } from "@/content/config";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/catalog";

const ITEM =
  "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[0.6875rem] font-medium tracking-wide transition-colors";

const FOOTER_GAP = 120;

export function MobileActionBar({ project }: { project: Project }) {
  const { request } = useDetailRequest();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const hero = document.getElementById("hero");
      const pastHero = hero ? hero.getBoundingClientRect().bottom < 120 : true;
      const atEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - FOOTER_GAP;
      setVisible(pastHero && !atEnd);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const whatsAppDigits = SITE.advisorWhatsApp.replace(/[^\d]/g, "");
  const whatsAppHref = whatsAppDigits
    ? `https://wa.me/${whatsAppDigits}?text=${encodeURIComponent(
        `I would like details on ${project.name}.`,
      )}`
    : null;
  const callHref = SITE.advisorPhone ? `tel:${SITE.advisorPhone.replace(/\s+/g, "")}` : null;

  return (
    <div
      data-surface="light"
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[80] border-t border-[color:var(--hairline)] bg-bone-100/95 backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-luxe)] lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav aria-label={`${project.name} quick actions`} className="flex items-stretch">
        <button
          type="button"
          onClick={() => request(`details on ${project.name}`, "property-enquiry")}
          className={cn(ITEM, "bg-[color:var(--text-primary)] text-[color:var(--surface)]")}
        >
          <Send aria-hidden className="size-4" />
          Enquire
        </button>

        {whatsAppHref ? (
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(ITEM, "border-l border-[color:var(--hairline)] text-[color:var(--text-primary)] hover:text-[color:var(--accent)]")}
          >
            <MessageCircle aria-hidden className="size-4" />
            WhatsApp
          </a>
        ) : (
          <button
            type="button"
            onClick={() => request("a WhatsApp conversation with an advisor", "whatsapp")}
            className={cn(ITEM, "border-l border-[color:var(--hairline)] text-[color:var(--text-primary)] hover:text-[color:var(--accent)]")}
          >
            <MessageCircle aria-hidden className="size-4" />
            WhatsApp
          </button>
        )}

        {callHref ? (
          <a
            href={callHref}
            className={cn(ITEM, "border-l border-[color:var(--hairline)] text-[color:var(--text-primary)] hover:text-[color:var(--accent)]")}
          >
            <Phone aria-hidden className="size-4" />
            Call
          </a>
        ) : (
          <button
            type="button"
            onClick={() => request("a call back from an advisor", "callback")}
            className={cn(ITEM, "border-l border-[color:var(--hairline)] text-[color:var(--text-primary)] hover:text-[color:var(--accent)]")}
          >
            <Phone aria-hidden className="size-4" />
            Call
          </button>
        )}
      </nav>
    </div>
  );
}
