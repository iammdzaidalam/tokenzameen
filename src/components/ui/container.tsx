import { cn } from "@/lib/cn";

type Width = "default" | "wide" | "narrow" | "full";

const WIDTHS: Record<Width, string> = {
  narrow: "max-w-3xl",
  default: "max-w-[88rem]",
  wide: "max-w-[104rem]",
  full: "max-w-none",
};

export function Container({
  children,
  className,
  width = "default",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  width?: Width;
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
}) {
  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", WIDTHS[width], className)}>
      {children}
    </Tag>
  );
}
