import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

function pageHref(base: URLSearchParams, page: number): string {
  const next = new URLSearchParams(base);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const query = next.toString();
  return query ? `?${query}` : "?";
}

export function Pagination({
  page,
  pageSize,
  total,
  base,
  noun,
}: {
  page: number;
  pageSize: number;
  total: number;
  base: URLSearchParams;
  noun: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  const linkClass = (disabled: boolean) =>
    cn(
      "grid size-9 place-items-center rounded-full border border-[color:var(--hairline)] transition-colors",
      disabled
        ? "pointer-events-none opacity-40"
        : "hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
    );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 text-sm">
      <p className="tabular text-[color:var(--text-secondary)]">
        {total === 0 ? `No ${noun}` : `${first}–${last} of ${total.toLocaleString("en-IN")} ${noun}`}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={pageHref(base, page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={linkClass(page <= 1)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
        <span className="tabular text-xs text-[color:var(--text-muted)]">
          {page} / {pages}
        </span>
        <Link
          href={pageHref(base, page + 1)}
          aria-label="Next page"
          aria-disabled={page >= pages}
          tabIndex={page >= pages ? -1 : undefined}
          className={linkClass(page >= pages)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
