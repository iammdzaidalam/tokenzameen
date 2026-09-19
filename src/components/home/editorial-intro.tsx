import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { IndexLabel } from "@/components/ui/index-label";
import { Section } from "@/components/ui/section";
import { categories } from "@/lib/catalog";

export function EditorialIntro() {
  const names = categories.map((category) => category.name.toLowerCase());
  const list = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

  return (
    <Section tone="paper" space="lg" aria-labelledby="intro-heading">
      <Container width="wide">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <IndexLabel index="01">The idea</IndexLabel>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="intro-heading" className="max-w-4xl text-balance text-display-md text-[color:var(--text-primary)]">
              Don&rsquo;t search through thousands of properties. Discover the ones worth exploring.
            </h2>
            <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-[color:var(--text-secondary)] sm:text-lg">
              TokenZameen is a short, curated collection across {list} — each project presented with the
              pricing, documents and inventory it has actually released, and an advisor attached to every
              enquiry. Where something is not yet on file, the page says so instead of guessing.
            </p>
            <Link
              href="/verified"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--text-primary)] underline decoration-[color:var(--accent)] decoration-1 underline-offset-[6px] transition-opacity duration-300 hover:opacity-70"
            >
              The TokenZameen Verified standard
              <ArrowUpRight className="size-4 text-[color:var(--accent)] transition-transform duration-300 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
