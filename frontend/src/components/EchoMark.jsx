import React, { useRef } from 'react';
import { tokens } from '../styles/tokens';

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

export function SealStamp({ state = 'empty', size = 64, pop = false }) {
  const sealed = state === 'sealed';
  const pressed = state === 'pressed';
  const uid = useRef('seal' + Math.random().toString(36).slice(2, 8)).current;
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
        <circle cx="50" cy="50" r="47" fill={`url(#${uid})`} stroke={sealed ? tokens.waxDeep : tokens.border} strokeWidth="1.5" />
        {sealed && (
          <>
            <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="1.5 3.4" />
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
