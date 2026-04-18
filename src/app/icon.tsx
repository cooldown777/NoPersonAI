import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          borderRadius: 8,
          position: "relative",
        }}
      >
        N
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "#10B981",
            border: "1px solid white",
          }}
        />
      </div>
    ),
    size,
  );
}
