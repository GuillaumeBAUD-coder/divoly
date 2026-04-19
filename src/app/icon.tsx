import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

function buildSpiral() {
  const dots: { cx: number; cy: number; r: number; t: number }[] = [];
  const nDots = 300;
  const nTurns = 3.8;
  const totalAngle = nTurns * 2 * Math.PI;
  const maxRadius = 44;
  for (let i = 0; i < nDots; i++) {
    const t = i / (nDots - 1);
    const angle = t * totalAngle;
    const radius = maxRadius * (1 - t * 0.93);
    const cx = 50 + radius * Math.cos(angle - Math.PI / 2);
    const cy = 50 + radius * Math.sin(angle - Math.PI / 2);
    const r = 2.6 * (1 - t * 0.72) + 0.35;
    dots.push({ cx, cy, r, t });
  }
  return dots;
}

function interpolateColor(t: number): string {
  type RGB = [number, number, number];
  const stops: [number, RGB][] = [
    [0,    [147, 51,  234]],
    [0.35, [99,  102, 241]],
    [0.6,  [59,  130, 246]],
    [0.8,  [34,  211, 238]],
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

export default function Icon() {
  const dots = buildSpiral();
  const scale = 32 / 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "radial-gradient(circle at 50% 50%, #0d1b3e 0%, #050a1a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={Math.max(d.r * 1.2, 0.6)}
              fill={interpolateColor(d.t)}
              opacity={0.85 + d.t * 0.15}
            />
          ))}
          {/* core glow */}
          <circle cx="50" cy="50" r="4" fill="white" opacity="0.9" />
          <circle cx="50" cy="50" r="7" fill="white" opacity="0.15" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
