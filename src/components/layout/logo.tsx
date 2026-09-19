import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 text-[color:var(--text-primary)]",
        className,
      )}
      aria-label="TokenZameen home"
    >
      <span
        aria-hidden
        className="relative grid size-8 place-items-center rounded-[9px] bg-[color:var(--text-primary)] transition-colors duration-500"
      >
        <span className="block size-2.5 rotate-45 border border-[color:var(--surface)] transition-transform duration-500 group-hover:rotate-[135deg]" />
      </span>
      <span className="font-display text-[0.9375rem] font-semibold tracking-[0.16em] uppercase">
        Token<span className="text-[color:var(--accent)]">Zameen</span>
      </span>
    </Link>
  );
}
