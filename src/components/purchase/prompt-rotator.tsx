"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const PROMPT_MS = 4200;

export function PromptRotator({ prompts }: { prompts: string[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || prompts.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % prompts.length);
    }, PROMPT_MS);
    return () => window.clearInterval(id);
  }, [reduced, prompts.length]);

  if (reduced) {
    return <span className="block truncate">{prompts[0]}</span>;
  }

  return (
    <span className="relative block h-[1.6em] overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={prompts[index]}
          initial={{ opacity: 0, y: "60%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "-60%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-0 block truncate"
        >
          {prompts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
