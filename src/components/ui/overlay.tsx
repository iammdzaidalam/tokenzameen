"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLockBodyScroll, useMounted } from "@/lib/hooks";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Placement = "center" | "bottom" | "right" | "full";

const PANEL_POSITION: Record<Placement, string> = {
  center: "inset-0 m-auto h-fit max-h-[88vh] w-[min(46rem,calc(100vw-2rem))]",
  bottom: "inset-x-0 bottom-0 max-h-[90vh] w-full",
  right: "inset-y-0 right-0 h-full w-[min(30rem,100vw)]",
  full: "inset-0 h-full w-full",
};

const PANEL_RADIUS: Record<Placement, string> = {
  center: "rounded-panel",
  bottom: "rounded-t-panel",
  right: "",
  full: "",
};

const MOTION: Record<Placement, { initial: Record<string, number>; animate: Record<string, number> }> = {
  center: { initial: { opacity: 0, scale: 0.97, y: 12 }, animate: { opacity: 1, scale: 1, y: 0 } },
  bottom: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
  right: { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
  full: { initial: { opacity: 0 }, animate: { opacity: 1 } },
};

export function Overlay({
  open,
  onClose,
  children,
  title,
  description,
  placement = "center",
  className,
  panelClassName,
  showClose = true,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  placement?: Placement;
  className?: string;
  panelClassName?: string;
  showClose?: boolean;
  labelledBy?: string;
}) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  useLockBodyScroll(open);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown, true);
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    }, 40);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.clearTimeout(timer);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className={cn("fixed inset-0 z-[120]", className)} role="presentation">
          <motion.div
            className="absolute inset-0 bg-carbon-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : title}
            aria-labelledby={labelledBy}
            aria-describedby={description ? `${labelledBy ?? "overlay"}-description` : undefined}
            tabIndex={-1}
            className={cn(
              "absolute flex flex-col overflow-hidden border border-[color:var(--hairline)] bg-carbon-850 text-bone-100 shadow-panel outline-none",
              PANEL_POSITION[placement],
              PANEL_RADIUS[placement],
              panelClassName,
            )}
            initial={reduced ? { opacity: 0 } : MOTION[placement].initial}
            animate={reduced ? { opacity: 1 } : MOTION[placement].animate}
            exit={reduced ? { opacity: 0 } : MOTION[placement].initial}
            transition={{ duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            {title || showClose ? (
              <div className="flex items-start justify-between gap-6 border-b border-[color:var(--hairline)] px-6 py-5">
                <div>
                  {title ? (
                    <h2 id={labelledBy} className="text-display-sm">
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p
                      id={`${labelledBy ?? "overlay"}-description`}
                      className="mt-1 text-sm text-steel-300"
                    >
                      {description}
                    </p>
                  ) : null}
                </div>
                {showClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full border border-[color:var(--hairline)] text-steel-300 transition-colors hover:border-gold-400/50 hover:text-gold-200"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
