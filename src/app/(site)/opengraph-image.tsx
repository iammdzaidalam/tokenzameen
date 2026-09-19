import { ImageResponse } from "next/og";
import { SITE } from "@/content/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — ${SITE.tagline}`;

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #060607 0%, #131418 55%, #0a0a0c 100%)",
          color: "#f5f3ee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 34,
              height: 34,
              border: "1px solid #c9a961",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 12, height: 12, border: "1px solid #c9a961", transform: "rotate(45deg)" }} />
          </div>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, textTransform: "uppercase" }}>
            <span>Token</span>
            <span style={{ color: "#c9a961" }}>Zameen</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -3 }}>Real Estate,</div>
          <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -3, color: "#c9a961" }}>Curated.</div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#939aa4", maxWidth: 820, lineHeight: 1.4 }}>
            Apartments, villas, commercial spaces, sustainable communities, spiritual
            residences and land — selected by TokenZameen.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ height: 1, width: 120, background: "#c9a961" }} />
          <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#767d88" }}>
            Discover the ones worth exploring
          </div>
        </div>
      </div>
    ),
    size,
  );
}
