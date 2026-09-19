import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { discoverLinks, purchaseLinks } from "@/components/layout/nav-data";
import { SITE } from "@/content/config";

const companyLinks = [
  { href: "/verified", label: "TokenZameen Verified" },
  { href: "/advisory", label: "Wealth Advisory" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/legal/terms", label: "Terms of Use" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-carbon-950 text-bone-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-40 h-96 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(201,169,97,0.14),transparent_70%)]"
      />
      <Container width="wide" className="relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 font-display text-display-sm text-bone-100">
              Don&apos;t search through thousands of properties.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-steel-400">
              Discover the ones worth exploring.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {SITE.advisorPhone ? (
                <a
                  href={`tel:${SITE.advisorPhone}`}
                  className="rounded-full border border-white/12 px-4 py-2 text-sm text-steel-300 transition-colors hover:border-gold-400/50 hover:text-gold-200"
                >
                  {SITE.advisorPhone}
                </a>
              ) : null}
              {SITE.advisorEmail ? (
                <a
                  href={`mailto:${SITE.advisorEmail}`}
                  className="rounded-full border border-white/12 px-4 py-2 text-sm text-steel-300 transition-colors hover:border-gold-400/50 hover:text-gold-200"
                >
                  {SITE.advisorEmail}
                </a>
              ) : null}
            </div>
          </div>

          <FooterColumn title="Purchase" links={purchaseLinks} />
          <FooterColumn title="Discover" links={discoverLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-steel-500">
            TokenZameen presents curated real-estate opportunities. Property information,
            pricing, availability and documentation are supplied by developers and project
            owners, and are subject to change and to verification. Nothing on this site is an
            offer, an invitation to invest, or a guarantee of return. Figures shown in
            calculators and investment summaries are indicative and depend on final
            documentation, lease terms, taxes and transaction costs.
          </p>
          <div className="mt-8 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-steel-500">
              © {year} TokenZameen. All rights reserved.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-steel-400 transition-colors hover:text-bone-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="eyebrow text-steel-500">{title}</p>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm text-steel-300 transition-colors hover:text-bone-100"
            >
              {link.label}
              <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
