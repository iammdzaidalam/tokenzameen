"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { discoverLinks, primaryNav, purchaseLinks } from "@/components/layout/nav-data";
import { cn } from "@/lib/cn";
import { useLockBodyScroll } from "@/lib/hooks";

type Panel = "purchase" | "discover" | null;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();
  useLockBodyScroll(mobileOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setPanel(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  const panelLinks = panel === "purchase" ? purchaseLinks : panel === "discover" ? discoverLinks : [];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || panel
          ? "border-b border-white/10 bg-carbon-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
      onMouseLeave={() => setPanel(null)}
    >
      <Container width="wide" className="flex h-[72px] items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <div key={item.href} onMouseEnter={() => setPanel(item.panel)}>
                  <Link
                    href={item.href}
                    aria-expanded={item.panel ? panel === item.panel : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm transition-colors",
                      isActive || panel === item.panel
                        ? "text-bone-100"
                        : "text-steel-300 hover:text-bone-100",
                    )}
                  >
                    {item.label}
                    {isActive ? (
                      <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold-400" />
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/purchase/properties"
            aria-label="Search properties"
            className="grid size-10 place-items-center rounded-full border border-white/10 text-steel-300 transition-colors hover:border-gold-400/50 hover:text-gold-200"
          >
            <Search className="size-4" />
          </Link>
          <Button href="/advisory" size="sm" className="hidden sm:inline-flex">
            Talk to an Advisor
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-full border border-white/10 text-steel-300 transition-colors hover:text-bone-100 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {panel ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="hidden border-t border-white/10 bg-carbon-950/95 backdrop-blur-xl lg:block"
          >
            <Container width="wide" className="grid grid-cols-3 gap-x-10 gap-y-2 py-8">
              {panelLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start justify-between gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/5"
                >
                  <span>
                    <span className="block font-subhead text-[0.9375rem] font-medium text-bone-100">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-steel-400">
                      {link.description}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-steel-500 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-400" />
                </Link>
              ))}
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex flex-col bg-carbon-950 lg:hidden"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-white/10 text-steel-300"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-10">
              <MobileGroup title="Purchase" links={purchaseLinks} />
              <MobileGroup title="Discover" links={discoverLinks} />
              <div className="mt-8 flex flex-col gap-3">
                <Button href="/verified" variant="secondary" full>
                  TokenZameen Verified
                </Button>
                <Button href="/advisory" full>
                  Talk to an Advisor
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function MobileGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <div className="mt-8 first:mt-4">
      <p className="eyebrow text-gold-400">{title}</p>
      <div className="mt-3 divide-y divide-white/8 border-y border-white/8">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between gap-4 py-4">
            <span>
              <span className="block font-subhead text-base text-bone-100">{link.label}</span>
              <span className="mt-0.5 block text-[0.8125rem] text-steel-400">{link.description}</span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-steel-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
