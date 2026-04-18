import { ImageResponse } from "next/og";

export const alt = "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,70,229,0.35), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(16,185,129,0.2), transparent 60%), #0B0B12",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              position: "relative",
            }}
          >
            <span>N</span>
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 12,
                height: 12,
                borderRadius: 9999,
                background: "#10B981",
                border: "2px solid white",
                display: "flex",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span>NoPerson</span>
            <span style={{ color: "#818CF8" }}>AI</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 960,
            }}
          >
            A LinkedIn ghostwriter that sounds exactly like you.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#A5B4FC",
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Send a text or voice note via WhatsApp → get a ready-to-post LinkedIn post back.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, color: "#D4D4D8", fontSize: 22 }}>
          <span>nopersonai.com</span>
          <span>·</span>
          <span>Free to start · 5 posts / month</span>
        </div>
      </div>
    ),
    size,
  );
}
