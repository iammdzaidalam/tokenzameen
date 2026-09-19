"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { SectionHeading } from "@/components/property/detail/detail-primitives";
import { Container } from "@/components/ui/container";
import { Overlay } from "@/components/ui/overlay";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { MediaAsset } from "@/types/catalog";

export function GallerySection({
  name,
  gallery,
}: {
  name: string;
  gallery: MediaAsset[];
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const lead = gallery[0];
  const rest = gallery.slice(1);

  return (
    <Section
      id="gallery"
      tone="darker"
      aria-label={`${name} gallery`}
      className="scroll-mt-[9.5rem]"
    >
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Gallery" title="See the project" size="md" />
          <p className="tabular text-sm text-[color:var(--text-muted)]">
            {gallery.length} {gallery.length === 1 ? "image" : "images"}
          </p>
        </div>

        {lead ? (
          <div className="mt-12 flex flex-col gap-4">
            <GalleryTile
              asset={lead}
              index={0}
              total={gallery.length}
              name={name}
              onOpen={setOpenAt}
              className="aspect-[16/10] sm:aspect-[21/9]"
              sizes="(max-width: 1024px) 100vw, 90vw"
              priority
              showHint
            />

            {rest.length > 0 ? (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {rest.map((asset, index) => (
                  <li key={asset.src}>
                    <GalleryTile
                      asset={asset}
                      index={index + 1}
                      total={gallery.length}
                      name={name}
                      onOpen={setOpenAt}
                      className="aspect-[4/3]"
                      sizes="(max-width: 640px) 45vw, 30vw"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="mt-12 text-sm text-[color:var(--text-secondary)]">
            Project imagery is published here once the developer releases it.
          </p>
        )}
      </Container>

      <Overlay
        open={openAt !== null}
        onClose={() => setOpenAt(null)}
        placement="full"
        title={`${name} — gallery`}
        panelClassName="bg-carbon-950"
      >
        {openAt !== null ? (
          <Lightbox gallery={gallery} startIndex={openAt} name={name} />
        ) : null}
      </Overlay>
    </Section>
  );
}

function GalleryTile({
  asset,
  index,
  total,
  name,
  onOpen,
  className,
  sizes,
  priority = false,
  showHint = false,
}: {
  asset: MediaAsset;
  index: number;
  total: number;
  name: string;
  onOpen: (index: number) => void;
  className?: string;
  sizes: string;
  priority?: boolean;
  showHint?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Open image ${index + 1} of ${total}: ${asset.alt}`}
      className={cn(
        "group relative w-full overflow-hidden rounded-card border border-[color:var(--hairline)] bg-carbon-800",
        className,
      )}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-carbon-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="glass absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.6875rem] text-bone-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <Expand className="size-3" />
        {showHint ? `View all ${total}` : "Expand"}
      </span>
      {asset.caption ? (
        <span className="absolute inset-x-3 top-3 text-left text-xs text-bone-100 drop-shadow">
          {asset.caption}
        </span>
      ) : null}
      <span className="sr-only">{name}</span>
    </button>
  );
}

function Lightbox({
  gallery,
  startIndex,
  name,
}: {
  gallery: MediaAsset[];
  startIndex: number;
  name: string;
}) {
  const reduced = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: false,
    duration: reduced ? 0 : 26,
    align: "center",
  });
  const [selected, setSelected] = useState(startIndex);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [scrollPrev, scrollNext]);

  const current = gallery[selected];

  return (
    <div data-surface="dark" className="flex h-full flex-col text-bone-100">
      <div ref={emblaRef} className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full">
          {gallery.map((asset) => (
            <div key={asset.src} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image
                src={asset.src}
                alt={asset.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-[color:var(--hairline)] px-5 py-4 sm:px-8">
        <div className="min-w-0">
          <p aria-live="polite" className="tabular text-sm text-bone-100">
            {selected + 1} / {gallery.length}
          </p>
          <p className="mt-1 truncate text-xs text-steel-300">
            {current?.caption ?? current?.alt ?? name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={selected === 0}
            aria-label="Previous image"
            className="grid size-11 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-bone-100 transition-colors hover:border-gold-400/60 hover:text-gold-200 disabled:opacity-35"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={selected === gallery.length - 1}
            aria-label="Next image"
            className="grid size-11 place-items-center rounded-full border border-[color:var(--hairline-strong)] text-bone-100 transition-colors hover:border-gold-400/60 hover:text-gold-200 disabled:opacity-35"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
