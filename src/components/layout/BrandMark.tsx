/**
 * IngCalc Brand Mark — Precision Compass
 *
 * Minimalist, architectural vector mark.
 * Pure geometric lines adapting via currentColor with a signal amber focal point.
 */
export function BrandMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Top pivot hinge */}
      <circle
        cx="16"
        cy="6"
        r="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Drafting compass legs */}
      <path
        d="M14.5 8.2 L6.5 26.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M17.5 8.2 L25.5 26.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Calibration radian arc */}
      <path
        d="M10.2 20.5 A 9.5 9.5 0 0 0 21.8 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Signal amber focal point */}
      <circle
        cx="16"
        cy="22.8"
        r="2"
        className="brand-mark-accent"
      />
    </svg>
  );
}
