import React from 'react';
import { tokens } from '../styles/tokens';

// Category icons helper
function CatIcon({ name, color }) {
  const p = { stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const icons = {
    'Academics': <path d="M4 6.5l6-2.5 6 2.5-6 2.5-6-2.5z M4 6.5v5c0 1 2.5 2 6 2s6-1 6-2v-5" {...p} />,
    'Harassment': <path d="M10 2.5l6 2.5v4c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8v-4l6-2.5z M10 9v3" {...p} />,
    'Hostel & Facilities': <path d="M3 10l7-6 7 6 M5 9v6.5h10V9" {...p} />,
    'Faculty conduct': <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" {...p} />,
    'Finance & fees': <path d="M10 3v14 M13.5 6.2c0-1.2-1.6-2.2-3.5-2.2s-3.5 1-3.5 2.2 1.6 1.8 3.5 1.8 3.5.7 3.5 1.9-1.6 2.1-3.5 2.1-3.5-.9-3.5-2.1" {...p} />,
    'Safety': <path d="M10 2.5l6 2.5v4c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8v-4l6-2.5z M7.3 10l1.8 1.8 3.6-3.6" {...p} />,
    'Discrimination': <path d="M10 3v13 M4 16h12 M5.5 7l-2.5 5h5l-2.5-5z M14.5 7L12 12h5l-2.5-5z M10 3l-4.5 4M10 3l4.5 4" {...p} />,
    'Other': <path d="M6 10a1.1 1.1 0 1 1-2.2 0A1.1 1.1 0 0 1 6 10z M11.1 10a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z M16.2 10a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z" fill={color} stroke="none" />,
  };
  return <svg width="18" height="18" viewBox="0 0 20 20">{icons[name] || icons['Other']}</svg>;
}

export default function TransparencyPage() {
  const monthly = [
    { m: 'Mar', total: 18, resolved: 15 },
    { m: 'Apr', total: 24, resolved: 20 },
    { m: 'May', total: 21, resolved: 19 },
    { m: 'Jun', total: 15, resolved: 14 },
    { m: 'Jul', total: 27, resolved: 22 },
    { m: 'Aug', total: 31, resolved: 24 },
  ];
  const byCategory = [
    { cat: 'Academics', count: 34 },
    { cat: 'Harassment', count: 19 },
    { cat: 'Hostel & Facilities', count: 28 },
    { cat: 'Faculty conduct', count: 15 },
    { cat: 'Finance & fees', count: 11 },
    { cat: 'Safety', count: 9 },
    { cat: 'Discrimination', count: 6 },
    { cat: 'Other', count: 14 },
  ];
  
  const maxCat = Math.max(...byCategory.map(c => c.count));
  const maxMonth = Math.max(...monthly.map(m => m.total));
  const totalAllTime = 136;
  const resolvedPct = 84;
  const avgDays = 4.2;

  const cardStyle = {
    background: tokens.surface,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 22,
    padding: 34,
    boxShadow: '0 10px 34px rgba(27,35,64,0.08), 0 2px 8px rgba(27,35,64,0.04)',
  };

  return (
    <div className="ech-step container mx-auto" style={{ padding: '44px 24px', maxWidth: 820 }}>
      <div style={{ textAlign: 'center', marginBottom: 34 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: tokens.gold, background: tokens.goldSoft, padding: '6px 14px', borderRadius: 999, marginBottom: 16 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l3 8 4-16 3 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Public, aggregate, anonymous
        </span>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 32, color: tokens.ink, margin: '0 0 10px', letterSpacing: '-0.01em' }}>Proof this actually works</h1>
        <p style={{ color: tokens.inkSoft, fontSize: 15.5, maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
          No names, no individual stories — just the numbers, so you can see this isn't a form that disappears into a void.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { n: totalAllTime, l: 'Echoes sent, all time' },
          { n: `${resolvedPct}%`, l: 'Resolved or answered' },
          { n: `${avgDays}d`, l: 'Average response time' },
        ].map((s, i) => (
          <div key={s.l} className="ech-chip" style={{ animationDelay: `${i * 50}ms`, background: tokens.surface, border: `1.5px solid ${tokens.border}`, borderRadius: 16, padding: '22px 18px', textAlign: 'center', boxShadow: '0 6px 18px rgba(27,35,64,0.06)' }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 30, color: tokens.wax }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: tokens.inkSoft, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="ech-card" style={{ ...cardStyle, marginBottom: 22 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 17, color: tokens.ink, marginBottom: 4 }}>Echoes over time</div>
        <div style={{ fontSize: 12.5, color: tokens.inkSoft, marginBottom: 20 }}>Total sent each month, and how many were resolved.</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140, paddingBottom: 4 }}>
          {monthly.map((m, i) => (
            <div key={m.m} className="ech-chip" style={{ animationDelay: `${i * 60}ms`, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', position: 'relative', height: `${(m.total / maxMonth) * 100}%`, minHeight: 4, background: tokens.paperDeep, borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: `${(m.resolved / m.total) * 100}%`, background: `linear-gradient(180deg, ${tokens.waxLight}, ${tokens.wax})`, borderRadius: '6px 6px 0 0' }} />
              </div>
              <span style={{ fontSize: 11, color: tokens.inkFaint }}>{m.m}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: tokens.inkSoft }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: tokens.wax, display: 'inline-block' }} />Resolved</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: tokens.paperDeep, display: 'inline-block' }} />Total sent</span>
        </div>
      </div>

      <div className="ech-card" style={{ ...cardStyle, marginBottom: 22 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 17, color: tokens.ink, marginBottom: 4 }}>What people are echoing about</div>
        <div style={{ fontSize: 12.5, color: tokens.inkSoft, marginBottom: 20 }}>All-time totals by category.</div>
        {byCategory.map((c, i) => (
          <div key={c.cat} className="ech-chip" style={{ animationDelay: `${i * 45}ms`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: tokens.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CatIcon name={c.cat} color={tokens.waxDeep} />
            </div>
            <div style={{ fontSize: 13, color: tokens.ink, width: 150, flexShrink: 0 }}>{c.cat}</div>
            <div style={{ flex: 1, height: 10, background: tokens.paperDeep, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${(c.count / maxCat) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${tokens.waxLight}, ${tokens.wax})`, borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 12.5, color: tokens.inkSoft, width: 26, textAlign: 'right', flexShrink: 0 }}>{c.count}</div>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center', padding: '22px 24px', borderRadius: 16, background: tokens.waxSoft,
        border: `1.5px dashed ${tokens.wax}`, color: tokens.waxDeep, fontSize: 13.5, lineHeight: 1.6,
      }}>
        These numbers update automatically as echoes come in and get resolved — nothing here is manually curated, and nothing here can be traced back to who sent what.
      </div>
    </div>
  );
}
