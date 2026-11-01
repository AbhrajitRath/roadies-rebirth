import { useMemo } from "react";

const COLORS = ["#ff2e3b", "#ff8a1f", "#ffc83d", "#7be0a4", "#5ec8ff", "#c58bff"];

export default function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        dur: 1.4 + Math.random() * 1.2,
        drift: Math.round((Math.random() - 0.5) * 240),
        size: 6 + Math.round(Math.random() * 7),
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.round ? b.size : b.size * 1.6,
            background: b.color,
            borderRadius: b.round ? "50%" : 2,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            "--drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
