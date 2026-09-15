import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          viewBox="0 0 40 40"
          width="28"
          height="28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="18" r="14" stroke="#083A5C" strokeWidth="2.5" />
          <path d="M10 8 L20 26" stroke="#083A5C" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 8 L20 26" stroke="#083A5C" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="28" r="4" fill="#B45309" />
          <line x1="20" y1="34" x2="20" y2="40" stroke="#083A5C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
