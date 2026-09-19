import { ImageResponse } from "next/og";
import { categories, getAllProjects, getCategory, getProject } from "@/lib/catalog";
import { formatPriceFrom } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/labels";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TokenZameen property";

export function generateStaticParams() {
  return [
    ...categories.map((category) => ({ slug: category.slug })),
    ...getAllProjects().map((project) => ({ slug: project.slug })),
  ];
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  const project = category ? null : getProject(slug);

  const eyebrow = category ? "Collection" : project ? CATEGORY_LABEL[project.primaryCategory] : "TokenZameen";
  const title = category?.name ?? project?.name ?? "TokenZameen";
  const line = category?.tagline ?? project?.positioning ?? "Real Estate, Curated.";
  const meta = project ? `${project.location.label}  ·  ${formatPriceFrom(project.priceFrom)}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #060607 0%, #131418 60%, #0a0a0c 100%)",
          color: "#f5f3ee",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, letterSpacing: 6, textTransform: "uppercase" }}>
            Token<span style={{ color: "#c9a961" }}>Zameen</span>
          </div>
          <div style={{ fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: "#c9a961" }}>
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 980 }}>{title}</div>
          <div style={{ marginTop: 24, fontSize: 30, color: "#b4bac2", maxWidth: 900, lineHeight: 1.35 }}>
            {line}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ height: 1, width: 90, background: "#c9a961" }} />
          <div style={{ fontSize: 20, color: "#767d88" }}>{meta ?? "tokenzameen.com"}</div>
        </div>
      </div>
    ),
    size,
  );
}
