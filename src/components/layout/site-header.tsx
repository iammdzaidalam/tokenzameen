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
import { useLockBodyScroll, useScrolledPast } from "@/lib/hooks";

type Panel = "purchase" | "discover" | null;

interface MenuState {
  path: string;
  panel: Panel;
  mobileOpen: boolean;
}

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(16);
  const reduced = useReducedMotion();
  const [stored, setStored] = useState<MenuState>({ path: pathname, panel: null, mobileOpen: false });

  // Navigating away closes the menus, resolved during render rather than in an effect.
  const menu = stored.path === pathname ? stored : { path: pathname, panel: null, mobileOpen: false };
  const setPanel = (panel: Panel) => setStored({ path: pathname, panel, mobileOpen: false });
  const setMobileOpen = (mobileOpen: boolean) => setStored({ path: pathname, panel: null, mobileOpen });

  useLockBodyScroll(menu.mobileOpen);

  useEffect(() => {
    if (!menu.panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStored({ path: pathname, panel: null, mobileOpen: false });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu.panel, pathname]);

  const panelLinks =
    menu.panel === "purchase" ? purchaseLinks : menu.panel === "discover" ? discoverLinks : [];

  return (
    <header
      data-surface="light"
      className={cn(
        "sticky top-0 z-[100] transition-[background-color,border-color,box-shadow] duration-500",
        scrolled || menu.panel
          ? "border-b border-[color:var(--hairline)] bg-bone-100/85 backdrop-blur-xl"
          : "border-b border-transparent bg-bone-100",
      )}
      onMouseLeave={() => (menu.panel ? setPanel(null) : undefined)}
    >
      <Container width="wide" className="flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <div key={item.href} onMouseEnter={() => setPanel(item.panel)}>
                <Link
                  href={item.href}
                  aria-expanded={item.panel ? menu.panel === item.panel : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors",
                    isActive || menu.panel === item.panel
                      ? "text-carbon-900"
                      : "text-carbon-500 hover:text-carbon-900",
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold-600" />
                  ) : null}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/purchase/properties"
            aria-label="Search properties"
            className="grid size-10 place-items-center rounded-full border border-[color:var(--hairline)] text-carbon-500 transition-colors hover:border-carbon-900 hover:text-carbon-900"
          >
            <Search className="size-4" />
          </Link>
          <Button href="/advisory" variant="solid" size="sm" className="hidden sm:inline-flex">
            Talk to an Advisor
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-full border border-[color:var(--hairline)] text-carbon-500 transition-colors hover:text-carbon-900 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menu.panel ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="hidden border-t border-[color:var(--hairline)] bg-bone-50/95 backdrop-blur-xl lg:block"
          >
            <Container width="wide" className="grid grid-cols-3 gap-x-10 gap-y-2 py-8">
              {panelLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start justify-between gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-bone-200/70"
                >
                  <span>
                    <span className="block font-subhead text-[0.9375rem] font-medium text-carbon-900">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-carbon-500">
                      {link.description}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-steel-400 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-600" />
                </Link>
              ))}
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menu.mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex flex-col bg-bone-100 lg:hidden"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-[color:var(--hairline)] text-carbon-500"
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
                <Button href="/advisory" variant="solid" full>
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
      <p className="eyebrow text-gold-600">{title}</p>
      <div className="mt-3 divide-y divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between gap-4 py-4">
            <span>
              <span className="block font-subhead text-base text-carbon-900">{link.label}</span>
              <span className="mt-0.5 block text-[0.8125rem] text-carbon-500">{link.description}</span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-steel-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
