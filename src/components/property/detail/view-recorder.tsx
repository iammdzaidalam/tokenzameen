"use client";

import { useEffect } from "react";
import { useShortlist } from "@/components/providers/shortlist-provider";

export function ViewRecorder({ slug }: { slug: string }) {
  const { recordView } = useShortlist();

  useEffect(() => {
    recordView(slug);
  }, [recordView, slug]);

  return null;
}
