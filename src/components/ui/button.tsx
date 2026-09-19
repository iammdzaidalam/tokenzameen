import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "group/button relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,border-color,transform,opacity] duration-300 ease-[var(--ease-luxe)] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-400 text-carbon-950 hover:bg-gold-300 active:scale-[0.985] shadow-[0_8px_30px_-12px_rgba(201,169,97,0.7)]",
        secondary:
          "border border-[color:var(--hairline-strong)] bg-transparent text-[color:var(--text-primary)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
        solid:
          "bg-[color:var(--text-primary)] text-[color:var(--surface)] hover:opacity-90 active:scale-[0.985]",
        glass: "glass text-[color:var(--text-primary)] hover:bg-white/10",
        ghost:
          "bg-transparent text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
        link: "h-auto rounded-none p-0 text-[color:var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-[0.9375rem]",
        icon: "size-10 p-0",
      },
      full: { true: "w-full", false: "" },
    },
    compoundVariants: [{ variant: "link", size: "sm", class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md", full: false },
  },
);

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ButtonVariants &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AnchorProps = ButtonVariants &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

export function Button(props: ButtonProps | AnchorProps) {
  if ("href" in props && props.href !== undefined) {
    const { href, variant, size, full, className, ...rest } = props;
    const isExternal = /^(https?:|mailto:|tel:)/.test(href);
    if (isExternal) {
      const anchorRest = { ...(rest as Record<string, unknown>) };
      delete anchorRest.prefetch;
      return (
        <a
          href={href}
          className={cn(button({ variant, size, full }), className)}
          {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        />
      );
    }
    return <Link href={href} className={cn(button({ variant, size, full }), className)} {...rest} />;
  }
  const { variant, size, full, className, type = "button", ...rest } = props as ButtonProps;
  return <button type={type} className={cn(button({ variant, size, full }), className)} {...rest} />;
}

export { button as buttonStyles };
