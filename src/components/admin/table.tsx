import { cn } from "@/lib/cn";

export function Table({
  children,
  className,
  minWidth = "min-w-[48rem]",
  caption,
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
  caption: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-card border border-[color:var(--hairline)] bg-white", className)}>
      <table className={cn("w-full border-collapse text-sm", minWidth)}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-[color:var(--hairline)] bg-bone-50 px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
  muted = false,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  muted?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b border-[color:var(--hairline)] px-4 py-3 align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        muted ? "text-[color:var(--text-muted)]" : "text-[color:var(--text-primary)]",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("transition-colors last:[&>td]:border-b-0 hover:bg-bone-50", className)}>
      {children}
    </tr>
  );
}
