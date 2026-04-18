import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          borderRadius: 40,
          position: "relative",
        }}
      >
        N
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: "#10B981",
            border: "4px solid white",
          }}
        />
      </div>
    ),
    size,
  );
}
