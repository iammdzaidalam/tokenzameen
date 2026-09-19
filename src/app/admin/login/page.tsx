import type { Metadata } from "next";
import { KeyRound, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/admin/login-form";
import { firstParam } from "@/components/admin/format";
import { adminConfigStatus, safeAdminPath } from "@/lib/auth";
import { login } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = safeAdminPath(firstParam(params.next));
  const status = adminConfigStatus();

  return (
    <div
      data-surface="light"
      className="flex min-h-screen flex-col items-center justify-center bg-bone-100 px-5 py-16 text-carbon-900"
    >
      <Logo href="/" />
      <p className="eyebrow mt-6 text-[color:var(--text-muted)]">Internal panel</p>
      <div className="mt-8 w-full max-w-md rounded-panel border border-[color:var(--hairline)] bg-white p-8 shadow-lift sm:p-10">
        {status.configured ? (
          <>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-bone-100 text-[color:var(--text-secondary)]">
                <KeyRound aria-hidden className="size-4" />
              </span>
              <h1 className="text-display-sm">Sign in</h1>
            </div>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
              One admin credential, set in the environment. Sessions last twelve hours and
              extend while you work.
            </p>
            <div className="mt-8">
              <LoginForm action={login} next={next} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-signal-warning/15 text-signal-warning">
                <ShieldAlert aria-hidden className="size-4" />
              </span>
              <h1 className="text-display-sm">The panel is not configured</h1>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Sign-in is disabled on this environment because the admin credential is not set.
              Nothing can be viewed or changed until it is.
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
              Missing
            </p>
            <ul className="mt-2 divide-y divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]">
              {status.missing.map((key) => (
                <li key={key} className="py-2.5 font-mono text-sm">
                  {key}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[color:var(--text-secondary)]">
              <code className="font-mono text-xs">docs/ADMIN.md</code> explains how to generate
              the password hash and add all three variables with{" "}
              <code className="font-mono text-xs">vercel env add</code>.
            </p>
          </>
        )}
      </div>
      <p className="mt-8 max-w-md text-center text-xs text-[color:var(--text-muted)]">
        This area is for the TokenZameen team. Nothing here is indexed or public.
      </p>
    </div>
  );
}
