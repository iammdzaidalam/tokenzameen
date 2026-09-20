function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function siteUrl(path = "/"): string {
  const explicit = clean(process.env.NEXT_PUBLIC_SITE_URL);
  const vercel =
    clean(process.env.VERCEL_PROJECT_PRODUCTION_URL) ?? clean(process.env.VERCEL_URL);
  const base = explicit ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
  return new URL(path, base.startsWith("http") ? base : `https://${base}`).toString();
}

export function absoluteUrl(path: string): string {
  return siteUrl(path);
}
