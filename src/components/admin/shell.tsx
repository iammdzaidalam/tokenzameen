import { ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { AdminNav, MobileNav } from "./nav";

export function AdminShell({
  children,
  signOut,
}: {
  children: React.ReactNode;
  signOut: () => Promise<void>;
}) {
  return (
    <div
      data-surface="light"
      className="min-h-screen bg-bone-100 text-carbon-900 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"
    >
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[color:var(--hairline)] bg-bone-100 px-5 py-7 lg:flex">
        <div className="flex items-center justify-between gap-3 px-1">
          <Logo href="/admin" />
        </div>
        <p className="eyebrow mt-8 px-3 text-[color:var(--text-muted)]">Internal panel</p>
        <div className="mt-3 flex-1 overflow-y-auto">
          <AdminNav />
        </div>
        <div className="mt-6 flex flex-col gap-1 border-t border-[color:var(--hairline)] pt-5">
          <a
            href="/purchase"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[color:var(--text-secondary)] transition-colors hover:bg-white hover:text-[color:var(--text-primary)]"
          >
            <ExternalLink aria-hidden className="size-4" />
            Open the public site
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[color:var(--text-secondary)] transition-colors hover:bg-white hover:text-[color:var(--text-primary)]"
            >
              <LogOut aria-hidden className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[color:var(--hairline)] bg-bone-100/90 px-5 backdrop-blur-xl lg:hidden">
          <Logo href="/admin" />
          <div className="flex items-center gap-2">
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                className="grid size-10 place-items-center rounded-full border border-[color:var(--hairline)] text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                <LogOut className="size-4" />
              </button>
            </form>
            <MobileNav />
          </div>
        </header>
        <main id="admin-main" className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
