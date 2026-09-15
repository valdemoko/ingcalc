import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#FBFAF6",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Compass mark */}
        <svg
          viewBox="0 0 40 40"
          width="80"
          height="80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: "24px", display: "block" }}
        >
          <circle cx="20" cy="18" r="14" stroke="#083A5C" strokeWidth="2.5" />
          <path d="M10 8 L20 26" stroke="#083A5C" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 8 L20 26" stroke="#083A5C" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="28" r="4" fill="#B45309" />
          <line x1="20" y1="34" x2="20" y2="40" stroke="#083A5C" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#16232E",
            lineHeight: 1.1,
            marginBottom: "16px",
            display: "block",
          }}
        >
          IngCalc
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#45535F",
            lineHeight: 1.3,
            marginBottom: "24px",
            display: "block",
          }}
        >
          Free Technical Calculators for Engineers
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "32px",
            fontSize: "20px",
            color: "#083A5C",
            fontWeight: 600,
          }}
        >
          <span>57 Calculators</span>
          <span style={{ color: "#B45309" }}>·</span>
          <span>4 Sectors</span>
          <span style={{ color: "#B45309" }}>·</span>
          <span>Formulas · Examples · Limits</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
