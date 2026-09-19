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
        className="relative grid size-7 place-items-center rounded-[7px] border border-gold-400/50 transition-colors duration-500 group-hover:border-gold-400"
      >
        <span className="block size-2.5 rotate-45 border border-gold-400 transition-transform duration-500 group-hover:rotate-[135deg]" />
      </span>
      <span className="font-display text-[0.9375rem] font-semibold tracking-[0.16em] uppercase">
        Token<span className="text-gold-400">Zameen</span>
      </span>
    </Link>
  );
}
