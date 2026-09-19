"use client";

import { useEffect, useRef } from "react";
import { writeFormField } from "./form-bridge";

/**
 * Preselects controls inside a form this component does not own, once, after
 * mount. Used to honour `?intent=` on the advisory form, which has no props
 * for default purpose or category.
 */
export function FormPrefill({
  fields,
  children,
}: {
  fields: Record<string, string>;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const serialized = JSON.stringify(fields);

  useEffect(() => {
    const entries = Object.entries(JSON.parse(serialized) as Record<string, string>);
    for (const [name, value] of entries) writeFormField(root.current, name, value);
  }, [serialized]);

  return <div ref={root}>{children}</div>;
}
