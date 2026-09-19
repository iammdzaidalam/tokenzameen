import { SITE } from "@/content/config";

export function enquiryHref(slug?: string): string {
  return slug ? `/advisory?project=${encodeURIComponent(slug)}` : "/advisory";
}

export function siteVisitHref(slug?: string): string {
  const base = slug ? `/advisory?project=${encodeURIComponent(slug)}&` : "/advisory?";
  return `${base}request=site-visit`;
}

/** Falls back to the advisory form when no number is configured, rather than
 *  rendering a dead tel: or wa.me link. */
export function callHref(): string {
  return SITE.advisorPhone ? `tel:${SITE.advisorPhone.replace(/[^+\d]/g, "")}` : enquiryHref();
}

export function whatsAppHref(): string {
  const digits = SITE.advisorWhatsApp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : enquiryHref();
}
