"use client";

type Props = {
  size?: number;
  className?: string;
  animated?: boolean;
};

// Pre-computed spiral dots: Archimedean spiral, 3.8 turns, 300 dots
function buildSpiral() {
  const dots: { cx: number; cy: number; r: number; t: number }[] = [];
  const nDots = 300;
  const nTurns = 3.8;
  const totalAngle = nTurns * 2 * Math.PI;
  const maxRadius = 44;

  for (let i = 0; i < nDots; i++) {
    const t = i / (nDots - 1); // 0 = outer, 1 = inner
    const angle = t * totalAngle;
    const radius = maxRadius * (1 - t * 0.93);
    const cx = 50 + radius * Math.cos(angle - Math.PI / 2);
    const cy = 50 + radius * Math.sin(angle - Math.PI / 2);
    const r = 2.6 * (1 - t * 0.72) + 0.35;
    dots.push({ cx, cy, r, t });
  }
  return dots;
}

const DOTS = buildSpiral();

function interpolateColor(t: number): string {
  // outer ember -> burnt orange -> tangerine -> amber cream
  type RGB = [number, number, number];
  const stops: [number, RGB][] = [
    [0,    [154, 52,  18]],
    [0.35, [234, 88,  12]],
    [0.6,  [249, 115, 22]],
    [0.8,  [251, 191, 36]],
    [1,    [255, 255, 255]],
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const span = hi[0] - lo[0];
  const frac = span === 0 ? 0 : (t - lo[0]) / span;
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * frac);
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * frac);
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * frac);
  return `rgb(${r},${g},${b})`;
}

export function DivolyLogo({ size = 40, className = "", animated = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={animated ? { animation: "spin-slow 20s linear infinite" } : undefined}
    >
      <defs>
        {/* Deep navy background */}
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a1004" />
          <stop offset="100%" stopColor="#090504" />
        </radialGradient>
        {/* Core glow */}
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#fed7aa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <filter id="blur-core">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id="blur-dot">
          <feGaussianBlur stdDeviation="0.3" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#bg)" />

      {/* Spiral dots */}
      {DOTS.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={interpolateColor(d.t)}
          opacity={0.4 + d.t * 0.6}
        />
      ))}

      {/* Core glow bloom */}
      <circle cx="50" cy="50" r="8" fill="url(#glow)" filter="url(#blur-core)" />
      <circle cx="50" cy="50" r="3" fill="white" opacity="0.95" filter="url(#blur-dot)" />
      <circle cx="50" cy="50" r="1.5" fill="white" />
    </svg>
  );
}

/** Full wordmark: spiral mark + "divoly" text */
export function DivolyWordmark({ height = 32, className = "" }: { height?: number; className?: string }) {
  const markSize = height;
  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ height }}>
      <DivolyLogo size={markSize} />
      <span
        style={{
          fontSize: height * 0.62,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "white",
          lineHeight: 1,
        }}
      >
        divoly
      </span>
    </div>
  );
}
