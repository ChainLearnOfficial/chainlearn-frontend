import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;

interface OgImageOptions {
  eyebrow: string;
  title: string;
  description?: string;
}

/**
 * Shared branded Open Graph image used by dynamic page metadata routes.
 */
export function createOgImage({
  eyebrow,
  title,
  description,
}: OgImageOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #7b3fe4 55%, #08b5e5 100%)",
          padding: 64,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                opacity: 0.88,
                maxWidth: 960,
                lineHeight: 1.35,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
