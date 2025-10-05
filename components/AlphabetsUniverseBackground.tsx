import React from "react"

// Array of objects: { char, style, lang }
const ALPHABETS = [
  { char: "ह", style: "text-orange-600", lang: "Hindi" },
  { char: "ि", style: "text-orange-600", lang: "Hindi" },
  { char: "ن", style: "text-green-600", lang: "Urdu" },
  { char: "দ", style: "text-blue-600", lang: "Bengali" },
  { char: "ਪ", style: "text-purple-600", lang: "Punjabi" },
  { char: "த", style: "text-red-600", lang: "Tamil" },
  { char: "గ", style: "text-indigo-600", lang: "Telugu" },
  { char: "ગ", style: "text-yellow-600", lang: "Gujarati" },
  { char: "म", style: "text-pink-600", lang: "Marathi" },
  // Hindustani Tongue spelled out in mixed scripts
  { char: "H", style: "text-foreground", lang: "Latin" },
  { char: "ि", style: "text-orange-600", lang: "Hindi" },
  { char: "ن", style: "text-green-600", lang: "Urdu" },
  { char: "d", style: "text-foreground", lang: "Latin" },
  { char: "ু", style: "text-blue-600", lang: "Bengali" },
  { char: "س", style: "text-green-600", lang: "Urdu" },
  { char: "त", style: "text-orange-600", lang: "Hindi" },
  { char: "a", style: "text-foreground", lang: "Latin" },
  { char: "ন", style: "text-blue-600", lang: "Bengali" },
  { char: "i", style: "text-foreground", lang: "Latin" },
  { char: "T", style: "text-foreground", lang: "Latin" },
  { char: "ো", style: "text-blue-600", lang: "Bengali" },
  { char: "ن", style: "text-green-600", lang: "Urdu" },
  { char: "g", style: "text-foreground", lang: "Latin" },
  { char: "u", style: "text-foreground", lang: "Latin" },
  { char: "e", style: "text-foreground", lang: "Latin" },
]

// Central area to avoid (percentages)
const CENTER = { left: 30, right: 70, top: 20, bottom: 50 }

// Generate random positions only on the sides
function getSidePosition(idx: number) {
  // Randomly pick left/right or top/bottom edge
  const edge = Math.random() < 0.5 ? "vertical" : "horizontal"
  let top, left
  if (edge === "vertical") {
    // Top or bottom edge, but not in center
    top = Math.random() < 0.5 ? Math.random() * CENTER.top : CENTER.bottom + Math.random() * (100 - CENTER.bottom)
    left = Math.random() * 100
    // Avoid center horizontally
    if (left > CENTER.left && left < CENTER.right) left = left < 50 ? CENTER.left : CENTER.right
  } else {
    // Left or right edge, but not in center
    left = Math.random() < 0.5 ? Math.random() * CENTER.left : CENTER.right + Math.random() * (100 - CENTER.right)
    top = Math.random() * 100
    // Avoid center vertically
    if (top > CENTER.top && top < CENTER.bottom) top = top < 50 ? CENTER.top : CENTER.bottom
  }
  const delay = Math.random() * 4
  const duration = 8 + Math.random() * 6
  const size = 32 + Math.random() * 32
  // Each alphabet will animate radially outward, scaling up and fading out
  return {
    top: `${top}%`,
    left: `${left}%`,
    fontSize: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: 0.7,
    zIndex: 0,
    '--start-scale': 0.7,
    '--end-scale': 1.6,
    '--start-opacity': 0.7,
    '--end-opacity': 0,
    '--move-x': `${(left < 50 ? -1 : 1) * (30 + Math.random() * 40)}%`,
    '--move-y': `${(top < 50 ? -1 : 1) * (20 + Math.random() * 30)}%`,
  } as React.CSSProperties
}

export const AlphabetsUniverseBackground: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className || ""}`}
    style={{ zIndex: 0 }}
    aria-hidden="true"
  >
    {ALPHABETS.map((item, idx) => (
      <span
        key={idx}
        className={`absolute select-none font-bold ${item.style}`}
        style={{
          ...getSidePosition(idx),
          animationName: "alphabetRadialFloat",
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
        }}
      >
        {item.char}
      </span>
    ))}
    <style>{`
      @keyframes alphabetRadialFloat {
        0% {
          transform: translate(0,0) scale(var(--start-scale,0.7));
          opacity: var(--start-opacity,0.7);
        }
        80% {
          transform: translate(var(--move-x,0), var(--move-y,0)) scale(var(--end-scale,1.6));
          opacity: 0.3;
        }
        100% {
          transform: translate(var(--move-x,0), var(--move-y,0)) scale(var(--end-scale,1.6));
          opacity: var(--end-opacity,0);
        }
      }
    `}</style>
  </div>
)
