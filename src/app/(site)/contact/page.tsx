import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Mail, MessageCircle, MessageSquareText, Phone, Sparkles } from "lucide-react";
import { CallbackForm } from "@/components/forms";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section } from "@/components/ui/section";
import { SITE } from "@/content/config";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Reach a TokenZameen property advisor — request a callback, send an enquiry, schedule a site visit or ask TokenZameen AI.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact · TokenZameen",
    description: DESCRIPTION,
    url: absoluteUrl("/contact"),
    type: "website",
  },
};

const ROUTES = [
  {
    href: "/advisory",
    icon: MessageSquareText,
    title: "Send an enquiry",
    body: "Budget, location, type, purpose, timeline — as much as you have.",
  },
  {
    href: "/advisory?request=site-visit",
    icon: CalendarDays,
    title: "Schedule a site visit",
    body: "Pick a day and a slot. An advisor confirms and meets you there.",
  },
  {
    href: "/advisory#ai",
    icon: Sparkles,
    title: "Ask TokenZameen AI",
    body: "Describe what you are after and get a grounded shortlist first.",
  },
];

const NEXT = [
  { index: "01", title: "We call you", body: "In the window you chose, from a TokenZameen advisor —." },
  { index: "02", title: "We shortlist with you", body: "The advisor works from what you told us and what each project has published." },
  { index: "03", title: "A site visit when you are ready", body: "Booked on a day you pick, confirmed by the same advisor." },
];

export default function ContactPage() {
  const whatsapp = SITE.advisorWhatsApp.replace(/\D/g, "");
  const rows = [
    SITE.advisorPhone
      ? { icon: Phone, label: "Call", value: SITE.advisorPhone, href: `tel:${SITE.advisorPhone.replace(/[^+\d]/g, "")}` }
      : null,
    whatsapp
      ? { icon: MessageCircle, label: "WhatsApp", value: SITE.advisorWhatsApp, href: `https://wa.me/${whatsapp}` }
      : null,
    SITE.advisorEmail
      ? { icon: Mail, label: "Email", value: SITE.advisorEmail, href: `mailto:${SITE.advisorEmail}` }
      : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <>
      <Section tone="bone" space="none" aria-labelledby="contact-heading" className="pb-16 pt-10 sm:pb-24 sm:pt-16">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
            <Reveal>
              <Eyebrow withRule>Contact</Eyebrow>
              <h1 id="contact-heading" className="mt-5 text-balance text-display-xl">
                Reach an advisor.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
                Every route on this page ends with a TokenZameen property advisor. Choose whichever suits the
                moment.
              </p>

              {rows.length ? (
                <ul className="mt-10 divide-y divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]">
                  {rows.map((row) => (
                    <li key={row.label}>
                      <a
                        href={row.href}
                        target={row.href.startsWith("https://") ? "_blank" : undefined}
                        rel={row.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                        className="group flex items-center gap-4 py-4 transition-colors hover:text-[color:var(--accent)]"
                      >
                        <row.icon className="size-4 shrink-0 text-[color:var(--accent)]" aria-hidden />
                        <span className="eyebrow w-20 shrink-0 text-[color:var(--text-muted)]">{row.label}</span>
                        <span className="flex-1 text-sm text-[color:var(--text-primary)]">{row.value}</span>
                        <ArrowUpRight className="size-4 shrink-0 text-[color:var(--text-muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-10 max-w-xl rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] px-5 py-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  Direct phone, WhatsApp and email lines are being set up. In the meantime the forms on this
                  page reach an advisor directly.
                </p>
              )}

              <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-3">
                {ROUTES.map((route) => (
                  <RevealItem as="li" key={route.href}>
                    <Link
                      href={route.href}
                      className="group flex h-full flex-col justify-between gap-6 rounded-card border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5 transition-[border-color,transform] duration-500 ease-[var(--ease-luxe)] hover:-translate-y-0.5 hover:border-[color:var(--hairline-strong)]"
                    >
                      <route.icon className="size-5 text-[color:var(--accent)]" aria-hidden />
                      <span>
                        <span className="block font-display text-base text-[color:var(--text-primary)]">{route.title}</span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-[color:var(--text-secondary)]">
                          {route.body}
                        </span>
                      </span>
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-panel border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5 shadow-lift sm:p-8">
                <p className="eyebrow text-[color:var(--text-muted)]">Quickest</p>
                <h2 className="mt-2 text-display-sm">Request a callback.</h2>
                <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                  Your name, your number and when to call. Nothing else is needed.
                </p>
                <div className="mt-6">
                  <CallbackForm source="callback" />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="darker" space="lg" aria-labelledby="next-heading">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <Eyebrow withRule>What happens next</Eyebrow>
              <h2 id="next-heading" className="mt-5 text-balance text-display-md">
                After you press send.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Every submission gets a reference code. Keep it — an advisor can pick up where you left off
                from that alone.
              </p>
            </Reveal>
            <RevealGroup as="ol" className="grid gap-x-8 gap-y-8 sm:grid-cols-3">
              {NEXT.map((step) => (
                <RevealItem as="li" key={step.index} className="relative border-t border-[color:var(--hairline)] pt-6">
                  <span aria-hidden className="absolute left-0 top-0 size-2 -translate-y-1/2 rounded-full bg-[color:var(--accent)]" />
                  <span className="eyebrow tabular text-[color:var(--text-muted)]">{step.index}</span>
                  <h3 className="mt-3 font-display text-base text-[color:var(--text-primary)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{step.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
          <p className="mt-14 max-w-3xl text-xs leading-relaxed text-[color:var(--text-muted)]">
            What we do with the details you send, and who may see them, is set out in the{" "}
            <Link href="/legal/privacy" className="text-[color:var(--accent)] underline-offset-4 hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
