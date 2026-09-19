import { ShortlistProvider } from "@/components/providers/shortlist-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <ShortlistProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-carbon-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-bone-100"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </ShortlistProvider>
  );
}
