"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const FRAME_MS = 6400;

export function HeroMontage({ frames }: { frames: string[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced || frames.length < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % frames.length);
    }, FRAME_MS);
    return () => window.clearInterval(id);
  }, [reduced, frames.length]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-carbon-950">
      {frames.map((src, index) => (
        <motion.div
          key={src}
          className="absolute inset-0 will-change-transform"
          initial={false}
          animate={{ opacity: index === active ? 1 : 0, scale: index === active ? 1.06 : 1 }}
          transition={{
            opacity: { duration: reduced ? 0 : 2.4, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: reduced ? 0 : 14, ease: "linear" },
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      ))}

      <div className="absolute inset-0 bg-carbon-950/55" />
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_0%,transparent_5%,rgba(6,6,7,0.62)_70%,#060607_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-carbon-950 via-carbon-950/65 to-transparent" />

      <div className="absolute bottom-10 right-8 hidden flex-col items-end gap-2.5 lg:flex">
        {frames.map((src, index) => (
          <span
            key={src}
            className={cn(
              "h-px transition-all duration-700 ease-[var(--ease-luxe)]",
              index === active ? "w-10 bg-gold-400" : "w-5 bg-bone-100/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
