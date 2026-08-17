import React, { useRef } from 'react';
import { tokens } from '../styles/tokens';

// Deterministic pseudo-randomness so the same seal instance doesn't
// re-jitter on every re-render, but different seals still look distinct.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// A slightly irregular blob path standing in for a hand-pressed wax edge —
// eight control points nudged in/out from a perfect circle, rounded with
// smooth curves so it still reads as "seal," just not machine-perfect.
function organicEdgePath(seed, radius = 47, cx = 50, cy = 50, wobble = 3.2) {
  const rand = seededRandom(seed);
  const points = 8;
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius + (rand() - 0.5) * wobble * 2;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  let d = `M ${pts[0][0]},${pts[0][1]} `;
  for (let i = 0; i < points; i++) {
    const [cx0, cy0] = pts[i];
    const [cx1, cy1] = pts[(i + 1) % points];
    const mx = (cx0 + cx1) / 2;
    const my = (cy0 + cy1) / 2;
    d += `Q ${cx0},${cy0} ${mx},${my} `;
  }
  d += 'Z';
  return d;
}

// Per-category outer silhouette, used only where a category is known (the
// submission confirmation) — everywhere else falls back to the organic
// circular blob so the seal still feels hand-pressed without needing context.
const CATEGORY_SHAPES = {
  'Academics': (cx, cy, r) => `M ${cx} ${cy - r} L ${cx + r * 0.87} ${cy - r * 0.5} L ${cx + r * 0.87} ${cy + r * 0.5} L ${cx} ${cy + r} L ${cx - r * 0.87} ${cy + r * 0.5} L ${cx - r * 0.87} ${cy - r * 0.5} Z`,
  'Harassment': (cx, cy, r) => `M ${cx} ${cy - r} C ${cx + r * 0.9} ${cy - r * 0.7} ${cx + r} ${cy - r * 0.1} ${cx + r * 0.6} ${cy + r * 0.5} C ${cx + r * 0.3} ${cy + r * 0.9} ${cx} ${cy + r} ${cx} ${cy + r} C ${cx} ${cy + r} ${cx - r * 0.3} ${cy + r * 0.9} ${cx - r * 0.6} ${cy + r * 0.5} C ${cx - r} ${cy - r * 0.1} ${cx - r * 0.9} ${cy - r * 0.7} ${cx} ${cy - r} Z`,
  'Faculty complaint': (cx, cy, r) => `M ${cx} ${cy - r} C ${cx + r * 0.9} ${cy - r * 0.7} ${cx + r} ${cy - r * 0.1} ${cx + r * 0.6} ${cy + r * 0.5} C ${cx + r * 0.3} ${cy + r * 0.9} ${cx} ${cy + r} ${cx} ${cy + r} C ${cx} ${cy + r} ${cx - r * 0.3} ${cy + r * 0.9} ${cx - r * 0.6} ${cy + r * 0.5} C ${cx - r} ${cy - r * 0.1} ${cx - r * 0.9} ${cy - r * 0.7} ${cx} ${cy - r} Z`,
  'Hostel & Facilities': (cx, cy, r) => `M ${cx} ${cy - r} L ${cx + r * 0.95} ${cy - r * 0.15} L ${cx + r * 0.65} ${cy + r * 0.9} L ${cx - r * 0.65} ${cy + r * 0.9} L ${cx - r * 0.95} ${cy - r * 0.15} Z`,
  'Finance & fees': (cx, cy, r) => {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
    }
    return `M ${pts.join(' L ')} Z`;
  },
};

export function EchoMark({ size = 30, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ overflow: 'visible', flexShrink: 0 }}>
      {animate && (
        <>
          <circle cx="20" cy="20" r="9" stroke={tokens.wax} strokeWidth="1.3" fill="none" style={{ animation: 'echoRipple 2.4s ease-out infinite', transformOrigin: '20px 20px' }} />
          <circle cx="20" cy="20" r="9" stroke={tokens.wax} strokeWidth="1.3" fill="none" style={{ animation: 'echoRipple 2.4s ease-out infinite 0.8s', transformOrigin: '20px 20px' }} />
        </>
      )}
      <circle cx="20" cy="20" r="16" fill={tokens.waxSoft} stroke={tokens.wax} strokeWidth="1.6" />
      <path d="M13.5 20.5l4 4L27 15" stroke={tokens.waxDeep} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SealStamp({ state = 'empty', size = 64, pop = false, category = null }) {
  const sealed = state === 'sealed';
  const pressed = state === 'pressed';
  const seedRef = useRef(Math.floor(Math.random() * 100000));
  const uid = useRef('seal' + Math.random().toString(36).slice(2, 8)).current;

  const shapeFn = category && CATEGORY_SHAPES[category];
  const edgePath = shapeFn
    ? shapeFn(50, 50, 46)
    : organicEdgePath(seedRef.current, 46);
  const innerRingPath = shapeFn
    ? shapeFn(50, 50, 38)
    : organicEdgePath(seedRef.current + 1, 38, 50, 50, 2.4);

  return (
    <div className={pop ? 'ech-seal-pop' : ''} style={{
      width: size, height: size, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', position: 'relative',
      transform: pressed ? 'scale(.86)' : 'scale(1)',
      transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)',
      flexShrink: 0,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={uid} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={sealed ? tokens.waxLight : tokens.paperDeep} />
            <stop offset="55%" stopColor={sealed ? tokens.wax : tokens.paper} />
            <stop offset="100%" stopColor={sealed ? tokens.waxDeep : tokens.borderSoft} />
          </radialGradient>
        </defs>
        <path d={edgePath} fill={`url(#${uid})`} stroke={sealed ? tokens.waxDeep : tokens.border} strokeWidth="1.5" strokeLinejoin="round" />
        {sealed && (
          <>
            <path d={innerRingPath} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="1.5 3.4" strokeLinejoin="round" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          </>
        )}
      </svg>
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" style={{ position: 'relative' }}>
        {sealed
          ? <path d="M5 13l4 4L19 7" stroke="#FCF5EC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          : <circle cx="12" cy="12" r="6" stroke={tokens.inkFaint} strokeWidth="1.5" />}
      </svg>
    </div>
  );
}