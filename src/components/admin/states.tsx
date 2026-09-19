import { AlertTriangle, Database, Hourglass } from "lucide-react";
import { Card } from "./card";

export function NoDatabase({ section }: { section: string }) {
  return (
    <Card as="section" className="mt-8 grid gap-8 p-8 md:grid-cols-[auto_minmax(0,1fr)] md:p-10" aria-label="No database connected">
      <span className="grid size-12 place-items-center rounded-full border border-[color:var(--hairline)] bg-bone-100 text-[color:var(--text-secondary)]">
        <Database aria-hidden className="size-5" />
      </span>
      <div className="max-w-2xl">
        <p className="eyebrow text-[color:var(--accent)]">No database connected</p>
        <h2 className="mt-3 text-display-sm">
          {section} has nothing to show until <code className="font-mono text-[0.9em]">DATABASE_URL</code> is set.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          This panel reads rows, never estimates. With no Postgres instance attached every
          repository call returns <code className="font-mono text-xs">no-database</code>, so
          this page shows an empty state instead of demonstration data.
        </p>
        <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm text-[color:var(--text-secondary)]">
          <li>Provision the instance: the steps are in <code className="font-mono text-xs">docs/DATA.md</code>.</li>
          <li>
            Set <code className="font-mono text-xs">DATABASE_URL</code> for this environment (
            <code className="font-mono text-xs">vercel env pull</code> locally).
          </li>
          <li>
            Run <code className="font-mono text-xs">pnpm db:push</code>, then{" "}
            <code className="font-mono text-xs">pnpm db:seed</code>.
          </li>
        </ol>
      </div>
    </Card>
  );
}

export function DataError({ message, context }: { message: string; context?: string }) {
  return (
    <Card as="section" className="mt-8 flex gap-5 p-6" aria-label="Data error">
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-signal-danger" />
      <div>
        <p className="text-sm font-medium">The database request failed{context ? ` while loading ${context}` : ""}.</p>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{message}</p>
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">
          The server log carries the full error under the <code className="font-mono">[db]</code> prefix.
        </p>
      </div>
    </Card>
  );
}

export function EmptyRows({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      <p className="max-w-md text-sm text-[color:var(--text-secondary)]">{body}</p>
    </div>
  );
}

export function LaterPhase({
  section,
  summary,
  holds,
  dependsOn,
}: {
  section: string;
  summary: string;
  holds: string[];
  dependsOn: string[];
}) {
  return (
    <Card as="section" className="mt-8 p-8 md:p-10" aria-label={`${section} is a later phase`}>
      <div className="flex items-center gap-3">
        <Hourglass aria-hidden className="size-4 text-[color:var(--accent)]" />
        <p className="eyebrow text-[color:var(--accent)]">Coming in a later phase</p>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)]">{summary}</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            What this section will hold
          </h2>
          <ul className="mt-3 divide-y divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]">
            {holds.map((item) => (
              <li key={item} className="py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
            What it depends on
          </h2>
          <ul className="mt-3 divide-y divide-[color:var(--hairline)] border-y border-[color:var(--hairline)]">
            {dependsOn.map((item) => (
              <li key={item} className="py-3 text-sm text-[color:var(--text-secondary)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-8 text-xs text-[color:var(--text-muted)]">
        Nothing here is stubbed with placeholder rows. The section appears in the navigation so
        the team knows where it will live.
      </p>
    </Card>
  );
}
