import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { FooterLandscape } from "@/components/layout/footer-landscape";
import { NewsletterForm } from "@/components/layout/newsletter-form";
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
    <footer
      data-surface="light"
      className="relative overflow-hidden border-t border-[color:var(--hairline)] bg-bone-50 text-carbon-900"
    >
      <Container width="wide" className="relative z-10 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,0.8fr)_1.1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-carbon-500">
              Don&apos;t search through thousands of properties. Discover the ones worth
              exploring.
            </p>
            <ul className="mt-7 flex flex-col gap-3 text-sm text-carbon-500">
              {SITE.advisorEmail ? (
                <li>
                  <a href={`mailto:${SITE.advisorEmail}`} className="flex items-center gap-3 transition-colors hover:text-carbon-900">
                    <Mail className="size-4 shrink-0 text-gold-600" />
                    {SITE.advisorEmail}
                  </a>
                </li>
              ) : null}
              {SITE.advisorPhone ? (
                <li>
                  <a href={`tel:${SITE.advisorPhone}`} className="flex items-center gap-3 transition-colors hover:text-carbon-900">
                    <Phone className="size-4 shrink-0 text-gold-600" />
                    {SITE.advisorPhone}
                  </a>
                </li>
              ) : null}
              <li className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-gold-600" />
                India
              </li>
            </ul>
          </div>

          <FooterColumn title="Purchase" links={purchaseLinks} />
          <FooterColumn title="Discover" links={discoverLinks} />
          <FooterColumn title="Company" links={companyLinks} />

          <div>
            <p className="eyebrow text-carbon-500">Collection updates</p>
            <p className="mt-5 text-sm leading-relaxed text-carbon-500">
              A short note when a property joins the collection, or when something
              already in it changes.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[color:var(--hairline)] pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-carbon-500">
            TokenZameen presents curated real-estate opportunities. Property
            information, pricing, availability and documentation are supplied by
            developers and project owners, and are subject to change and to
            verification. Nothing on this site is an offer, an invitation to invest, or
            a guarantee of return. Figures shown in calculators and investment summaries
            are indicative and depend on final documentation, lease terms, taxes and
            transaction costs.
          </p>
        </div>
      </Container>

      <div className="relative mt-10 h-48 sm:h-64 lg:h-72">
        <FooterLandscape className="absolute inset-0 size-full text-carbon-900/30" />
        <Container
          width="wide"
          className="absolute inset-x-0 bottom-0 flex flex-col-reverse gap-4 pb-7 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-carbon-500">© {year} TokenZameen. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-xs text-carbon-500 transition-colors hover:text-carbon-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
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
      <p className="eyebrow text-carbon-500">{title}</p>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm text-carbon-500 transition-colors hover:text-carbon-900"
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
