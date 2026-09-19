import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import SiteNotFound from "./(site)/not-found";

export default function RootNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <SiteNotFound />
      </main>
      <SiteFooter />
    </>
  );
}
