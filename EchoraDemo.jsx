import React, { useState, useRef, useEffect } from 'react';

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap';

// ---------- Design tokens: ink & sealing wax, not the default cream+terracotta pairing ----------
const tokens = {
  paper: '#EDE7DA',       // linen-toned background, not warm cream
  paperDeep: '#E3DCC9',
  surface: '#FFFCF5',
  ink: '#1B2340',          // deep navy ink
  inkSoft: '#565F82',
  inkFaint: '#8A90A8',
  wax: '#9C3B26',           // sealing-wax oxblood, not the generic terracotta
  waxDeep: '#742A1B',
  waxLight: '#C65A3D',
  waxSoft: '#F0DCCF',
  gold: '#A6813F',          // used sparingly, verification/trust accent
  goldSoft: '#F1E6CC',
  safe: '#4B7A5E',
  safeSoft: '#DEE9E1',
  border: '#DCD3BE',
  borderSoft: '#E7E0CE',
};

const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")";

const CSS = `
@keyframes echoRipple { 0% { transform: scale(0.3); opacity: 0.85; } 100% { transform: scale(2.3); opacity: 0; } }
@keyframes stepEnter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes chipEnter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardEnter { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes sealPop { 0% { transform: scale(0.55) rotate(-8deg); } 55% { transform: scale(1.15) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); } }
@keyframes envelopeBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes shine { 0% { transform: translateX(-120%) rotate(20deg); } 100% { transform: translateX(220%) rotate(20deg); } }
.ech-step { animation: stepEnter 0.4s cubic-bezier(.22,1,.36,1) both; }
.ech-card { animation: cardEnter 0.45s cubic-bezier(.22,1,.36,1) both; }
.ech-chip { animation: chipEnter 0.32s ease both; }
.ech-envelope { animation: envelopeBob 4.5s ease-in-out infinite; }
.ech-nav-link { transition: background .18s ease, color .18s ease, transform .12s ease; }
.ech-nav-link:hover { transform: translateY(-1px); }
.ech-btn-primary { position: relative; overflow: hidden; transition: background .18s ease, transform .1s ease, box-shadow .18s ease; }
.ech-btn-primary:hover:not(:disabled) { background: ${tokens.waxDeep}; box-shadow: 0 10px 26px rgba(156,59,38,0.32); }
.ech-btn-primary:active:not(:disabled) { transform: scale(0.97); }
.ech-btn-ghost { transition: border-color .18s ease, color .18s ease, background .18s ease; }
.ech-btn-ghost:hover { border-color: ${tokens.inkFaint}; color: ${tokens.ink}; background: ${tokens.paperDeep}; }
.ech-chip-btn { transition: border-color .15s ease, background .15s ease, transform .12s ease, box-shadow .15s ease; }
.ech-chip-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(27,35,64,0.08); }
.ech-input { transition: border-color .15s ease, background .15s ease, box-shadow .15s ease; }
.ech-input:focus { border-color: ${tokens.wax} !important; background: ${tokens.surface} !important; box-shadow: 0 0 0 4px ${tokens.waxSoft}; }
.ech-otp { transition: border-color .15s ease, transform .12s ease, box-shadow .15s ease; }
.ech-otp:focus { border-color: ${tokens.wax} !important; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(156,59,38,0.18); }
.ech-row { transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
.ech-row:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(27,35,64,0.09); border-color: ${tokens.border}; }
.ech-seal-pop { animation: sealPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
.ech-shine::after { content: ''; position: absolute; top: -50%; left: 0; width: 30%; height: 200%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent); animation: shine 2.6s ease-in-out infinite; animation-delay: 1s; }
@media (prefers-reduced-motion: reduce) {
  .ech-step, .ech-card, .ech-chip, .ech-seal-pop, .ech-envelope, .ech-shine::after { animation: none !important; }
}
`;

function useFonts() {
  useEffect(() => {
    if (document.getElementById('echora-fonts')) return;
    const link = document.createElement('link');
    link.id = 'echora-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_LINK;
    document.head.appendChild(link);
  }, []);
}

// ---------- Signature mark: ripple + sealed check ----------
function EchoMark({ size = 30, animate = false }) {
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

// ---------- Signature element: a tactile wax seal with ridges + gloss ----------
function SealStamp({ state = 'empty', size = 64, pop = false }) {
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

// ---------- Sealed envelope: the hero signature graphic ----------
function EnvelopeHero() {
  return (
    <div className="ech-envelope" style={{ width: 168, height: 118, margin: '0 auto 22px', position: 'relative' }}>
      <svg width="168" height="118" viewBox="0 0 168 118" fill="none">
        <rect x="4" y="14" width="160" height="100" rx="10" fill={tokens.surface} stroke={tokens.border} strokeWidth="1.5" />
        <path d="M4 24l80 54 80-54" stroke={tokens.border} strokeWidth="1.5" fill="none" />
        <path d="M4 24l76 50a10 10 0 0 0 8 0l76-50" fill={tokens.paperDeep} stroke={tokens.border} strokeWidth="1.5" />
      </svg>
      <div style={{ position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)' }}>
        <SealStamp state="sealed" size={46} />
      </div>
    </div>
  );
}

// ---------- Minimal category icons ----------
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

const inputStyle = {
  width: '100%', padding: '13px 15px', fontFamily: "'Work Sans',sans-serif", fontSize: 14.5,
  color: tokens.ink, background: tokens.paper, border: `1.5px solid ${tokens.border}`,
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
};

const btnPrimary = {
  width: '100%', padding: '14px 20px', borderRadius: 10, border: 'none',
  fontSize: 15, fontWeight: 600, background: tokens.wax, color: '#FCF5EC', cursor: 'pointer',
  letterSpacing: '0.01em',
};

const btnGhost = {
  width: '100%', padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
  background: 'transparent', border: `1.5px solid ${tokens.border}`, color: tokens.inkSoft, cursor: 'pointer', marginTop: 10,
};

const cardStyle = {
  background: tokens.surface, border: `1.5px solid ${tokens.border}`, borderRadius: 22,
  padding: 34, boxShadow: '0 10px 34px rgba(27,35,64,0.08), 0 2px 8px rgba(27,35,64,0.04)',
};

function Nav({ view, setView }) {
  const link = (v, label, primary) => (
    <button className="ech-nav-link" onClick={() => setView(v)} style={{
      fontFamily: "'Work Sans',sans-serif", fontSize: 13.5, fontWeight: 500,
      padding: '9px 17px', borderRadius: 999, border: 'none', cursor: 'pointer',
      background: primary ? tokens.wax : (view === v ? tokens.waxSoft : 'transparent'),
      color: primary ? '#FCF5EC' : (view === v ? tokens.waxDeep : tokens.inkSoft),
    }}>{label}</button>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '17px 26px',
      background: tokens.paper, borderBottom: `1.5px solid ${tokens.border}`, borderRadius: '18px 18px 0 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <EchoMark animate />
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 19, color: tokens.ink, lineHeight: 1 }}>Echora</div>
          <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 10.5, color: tokens.inkFaint, letterSpacing: '0.04em', marginTop: 2 }}>SEALED &amp; UNTRACEABLE</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {link('transparency', 'Transparency')}
        {link('mailbox', 'Track your echo')}
        {link('adminLogin', 'Admin portal')}
        {link('verify', 'Send an echo', true)}
      </div>
    </div>
  );
}

function SubmitFlow() {
  const [step, setStep] = useState('verify');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [otpStatus, setOtpStatus] = useState('idle');
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [ticketId, setTicketId] = useState('');
  const inputsRef = useRef([]);
  const fileInputRef = useRef(null);
  const steps = ['verify', 'otp', 'form', 'done'];
  const idx = steps.indexOf(step);
  const categories = ['Academics', 'Harassment', 'Hostel & Facilities', 'Faculty conduct', 'Finance & fees', 'Safety', 'Discrimination', 'Other'];
  const buildings = ['Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Academic Block', 'Library', 'Admin Block', 'Sports Complex', 'Cafeteria', 'Off-campus', 'Not applicable'];

  const handleDigit = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits]; next[i] = val; setDigits(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
    if (next.every(d => d !== '')) {
      setOtpStatus('pressed');
      setTimeout(() => { setOtpStatus('sealed'); setTimeout(() => setStep('form'), 550); }, 500);
    }
  };

  const submit = () => {
    setTicketId('ECH-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
    setStep('done');
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList).map(f => ({ name: f.name, size: f.size }));
    setAttachments(prev => [...prev, ...files].slice(0, 5));
  };
  const removeFile = (i) => setAttachments(prev => prev.filter((_, idx2) => idx2 !== i));
  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const reset = () => {
    setStep('verify'); setEmail(''); setDigits(Array(6).fill('')); setOtpStatus('idle');
    setCategory(''); setBuilding(''); setUrgent(false); setDescription(''); setAttachments([]);
  };

  return (
    <div style={{ padding: '44px 24px', maxWidth: 580, margin: '0 auto' }}>
      {step === 'verify' && (
        <div className="ech-step" style={{ textAlign: 'center', marginBottom: 8 }}>
          <EnvelopeHero />
        </div>
      )}

      {step !== 'done' && (
        <div className="ech-step" style={{ textAlign: 'center', marginBottom: 30 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: tokens.safe, background: tokens.safeSoft, padding: '6px 14px', borderRadius: 999, marginBottom: 16, letterSpacing: '0.01em' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            Heard, not identified
          </span>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 34, color: tokens.ink, margin: '0 0 10px', lineHeight: 1.12, letterSpacing: '-0.01em' }}>Send your echo</h1>
          <p style={{ color: tokens.inkSoft, fontSize: 15.5, maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>Say what happened. It reaches the people who can fix it — your name never does.</p>
        </div>
      )}

      {step !== 'done' && (
        <div className="ech-step" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 30 }}>
          <SealStamp state={idx >= 1 ? 'sealed' : 'empty'} size={26} />
          <div style={{ width: 44, height: 2, background: idx >= 1 ? tokens.wax : tokens.border, borderRadius: 2, transition: 'background .3s ease' }} />
          <SealStamp state={idx >= 2 ? 'sealed' : 'empty'} size={26} />
          <div style={{ width: 44, height: 2, background: idx >= 2 ? tokens.wax : tokens.border, borderRadius: 2, transition: 'background .3s ease' }} />
          <SealStamp state={idx >= 3 ? 'sealed' : 'empty'} size={26} />
        </div>
      )}

      <div className="ech-card" key={step} style={cardStyle}>
        {step === 'verify' && (
          <div className="ech-step">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: tokens.ink, margin: '0 0 6px' }}>Prove you belong here</h2>
              <p style={{ color: tokens.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>We check your email's domain, then forget the email. No name, no inbox record.</p>
            </div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>INSTITUTIONAL EMAIL ADDRESS</label>
            <input className="ech-input" style={{ ...inputStyle, marginBottom: 18 }} placeholder="you@institution.edu" value={email} onChange={e => setEmail(e.target.value)} />
            <button className="ech-btn-primary ech-shine" style={btnPrimary} onClick={() => email && setStep('otp')}>Send verification code</button>
          </div>
        )}

        {step === 'otp' && (
          <div className="ech-step">
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <SealStamp state={otpStatus === 'sealed' ? 'sealed' : otpStatus === 'pressed' ? 'pressed' : 'empty'} pop={otpStatus === 'sealed'} />
              </div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: tokens.ink, margin: '0 0 6px' }}>Enter your code</h2>
              <p style={{ color: tokens.inkSoft, fontSize: 13.5 }}>Sent to {email || 'you@institution.edu'} — try any 6 digits.</p>
            </div>
            <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginBottom: 18 }}>
              {digits.map((d, i) => (
                <input key={i} className="ech-otp" ref={el => (inputsRef.current[i] = el)} maxLength={1} value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  style={{ ...inputStyle, width: 44, height: 54, textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: 19, padding: 0, fontWeight: 500 }} />
              ))}
            </div>
            <button className="ech-btn-ghost" style={btnGhost} onClick={() => setStep('verify')}>Use a different email</button>
          </div>
        )}

        {step === 'form' && (
          <div className="ech-step">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: tokens.ink, margin: '0 0 6px' }}>Share your grievance</h2>
              <p style={{ color: tokens.inkSoft, fontSize: 13.5 }}>Your name and email are never attached to this.</p>
            </div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 9, letterSpacing: '0.01em' }}>CATEGORY</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 9, marginBottom: 20 }}>
              {categories.map((c, i) => {
                const active = category === c;
                return (
                  <button key={c} className="ech-chip ech-chip-btn" style={{ animationDelay: `${i * 35}ms`, border: 'none', background: 'none', padding: 0 }} onClick={() => setCategory(c)}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500, textAlign: 'left', cursor: 'pointer',
                      border: `1.5px solid ${active ? tokens.wax : tokens.border}`,
                      background: active ? tokens.waxSoft : tokens.paper,
                      color: active ? tokens.waxDeep : tokens.inkSoft,
                    }}>
                      <CatIcon name={c} color={active ? tokens.waxDeep : tokens.inkFaint} />
                      {c}
                    </span>
                  </button>
                );
              })}
            </div>

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>WHICH BUILDING / LOCATION <span style={{ fontWeight: 400, color: tokens.inkFaint, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <select
              className="ech-input"
              value={building}
              onChange={e => setBuilding(e.target.value)}
              style={{ ...inputStyle, marginBottom: 20, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A90A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', cursor: 'pointer' }}
            >
              <option value="">Select a building or location…</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>WHAT HAPPENED</label>
            <textarea className="ech-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the situation — what, where, when."
              style={{ ...inputStyle, minHeight: 108, marginBottom: 20, fontFamily: "'Work Sans',sans-serif", lineHeight: 1.5 }} />

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>ATTACHMENTS <span style={{ fontWeight: 400, color: tokens.inkFaint, textTransform: 'none', letterSpacing: 0 }}>(optional — screenshots, photos, documents)</span></label>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', padding: '16px', borderRadius: 10, border: `1.5px dashed ${tokens.border}`,
                background: tokens.paper, color: tokens.inkSoft, fontFamily: "'Work Sans',sans-serif", fontSize: 13.5,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: attachments.length ? 10 : 20,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 18v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke={tokens.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Click to attach files (up to 5)
            </button>
            {attachments.length > 0 && (
              <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attachments.map((f, i) => (
                  <div key={i} className="ech-chip" style={{ animationDelay: `${i * 40}ms`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: tokens.paper, border: `1px solid ${tokens.border}`, borderRadius: 8 }}>
                    <span style={{ fontSize: 12.5, color: tokens.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name} <span style={{ color: tokens.inkFaint }}>· {formatSize(f.size)}</span></span>
                    <button type="button" onClick={() => removeFile(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: tokens.inkFaint, fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setUrgent(u => !u)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer',
                padding: '13px 15px', borderRadius: 10, marginBottom: 20,
                border: `1.5px solid ${urgent ? '#B4453A' : tokens.border}`,
                background: urgent ? '#FBEAE7' : tokens.paper,
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${urgent ? '#B4453A' : tokens.inkFaint}`, background: urgent ? '#B4453A' : 'transparent',
              }}>
                {urgent && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: urgent ? '#B4453A' : tokens.ink }}>This needs urgent attention</div>
                <div style={{ fontSize: 12, color: tokens.inkSoft, marginTop: 1 }}>For situations involving immediate safety risk — flagged echoes get reviewed first.</div>
              </span>
            </button>

            {(() => {
              const ready = category && description.length >= 10;
              const needsCategory = !category;
              const needsDetail = description.length < 10;
              return (
                <>
                  <p style={{ fontSize: 12, color: ready ? tokens.safe : tokens.inkFaint, margin: '0 0 18px', minHeight: 16 }}>
                    {ready
                      ? 'Ready to send.'
                      : needsCategory && needsDetail
                        ? 'Pick a category and add a little more detail to send.'
                        : needsCategory
                          ? 'Pick a category above to send.'
                          : `Add a bit more detail — ${10 - description.length} more character${10 - description.length === 1 ? '' : 's'} to go.`}
                  </p>
                  <button
                    className={ready ? 'ech-btn-primary ech-shine' : ''}
                    style={ready ? btnPrimary : { ...btnPrimary, background: tokens.border, color: tokens.inkFaint, cursor: 'not-allowed' }}
                    disabled={!ready}
                    onClick={submit}
                  >
                    Seal and send my echo
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {step === 'done' && (
          <div className="ech-step">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><SealStamp state="sealed" size={76} pop /></div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: tokens.ink, margin: '0 0 6px' }}>Your echo is out there</h2>
              <p style={{ color: tokens.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>Save this ID — it's the only way to follow up. We can't recover it for you.</p>
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono',monospace", fontSize: 21, textAlign: 'center', background: tokens.paper,
              border: `1.5px dashed ${tokens.wax}`, borderRadius: 12, padding: 18, marginBottom: 20, letterSpacing: '0.06em', color: tokens.ink,
            }}>
              {ticketId}
            </div>
            <button className="ech-btn-primary" style={btnPrimary} onClick={reset}>Send another (demo reset)</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Transparency: public aggregate stats, no individual data ----------
function TransparencyPage() {
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

  return (
    <div className="ech-step" style={{ padding: '44px 24px', maxWidth: 820, margin: '0 auto' }}>
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

function Mailbox() {
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const stages = [
    { title: 'Echo received', desc: 'Your voice landed safely and is waiting in the queue.' },
    { title: 'Being looked into', desc: 'Someone on the review team is following up on it.' },
    { title: 'Answered', desc: 'A response is ready for you below.' },
  ];
  const lookup = () => setResult({ stageIndex: 1, reply: "We've interviewed two witnesses. Expect an update within 5 days." });
  return (
    <div style={{ padding: '44px 24px', maxWidth: 560, margin: '0 auto' }}>
      <div className="ech-step" style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 30, color: tokens.ink, margin: '0 0 10px', letterSpacing: '-0.01em' }}>Track your echo</h1>
        <p style={{ color: tokens.inkSoft, fontSize: 15 }}>Enter the ticket ID you saved when you sent it.</p>
      </div>
      <div className="ech-card" style={cardStyle}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>TICKET ID</label>
        <input className="ech-input" style={{ ...inputStyle, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 18 }} placeholder="Ticket ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="ech-btn-primary ech-shine" style={btnPrimary} onClick={lookup}>Check status</button>

        {result && (
          <div className="ech-step" style={{ marginTop: 26 }}>
            {stages.map((s, i) => {
              const done = i <= result.stageIndex;
              const current = i === result.stageIndex;
              return (
                <div key={s.title} style={{ display: 'flex', gap: 12, paddingBottom: 20, position: 'relative' }}>
                  {i < stages.length - 1 && <div style={{ position: 'absolute', left: 11, top: 26, bottom: 0, width: 2, background: i < result.stageIndex ? tokens.wax : tokens.border }} />}
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: current ? tokens.ink : done ? tokens.wax : tokens.border, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: done ? tokens.ink : tokens.inkFaint }}>{s.title}</div>
                    <div style={{ fontSize: 12.5, color: tokens.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ background: tokens.paper, border: `1.5px solid ${tokens.border}`, borderRadius: 10, padding: '13px 15px', fontSize: 13.5, color: tokens.inkSoft, lineHeight: 1.5 }}>
              {result.reply}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminLoginView({ onIn }) {
  return (
    <div style={{ padding: '44px 24px', maxWidth: 420, margin: '0 auto' }}>
      <div className="ech-step" style={{ textAlign: 'center', marginBottom: 26 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 27, color: tokens.ink, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Admin portal</h1>
        <p style={{ color: tokens.inkSoft, fontSize: 14 }}>For review team members only.</p>
      </div>
      <div className="ech-card" style={cardStyle}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>USERNAME</label>
        <input className="ech-input" style={{ ...inputStyle, marginBottom: 16 }} placeholder="Username" />
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>PASSWORD</label>
        <input type="password" className="ech-input" style={{ ...inputStyle, marginBottom: 22 }} placeholder="••••••••" />
        <button className="ech-btn-primary ech-shine" style={btnPrimary} onClick={onIn}>Sign in</button>
      </div>
    </div>
  );
}

function AdminDashboardView() {
  const rows = [
    { id: 'ECH-8X2K-QP41', category: 'Harassment', status: 'New', time: '2h ago' },
    { id: 'ECH-3F9L-MZ02', category: 'Academics', status: 'Under review', time: '1d ago' },
    { id: 'ECH-1J7B-RT88', category: 'Hostel & Facilities', status: 'Resolved', time: '4d ago' },
  ];
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  const heat = [
    { cat: 'Academics', vals: [1, 3, 2, 5, 2, 4] },
    { cat: 'Harassment', vals: [0, 1, 3, 2, 4, 6] },
    { cat: 'Hostel', vals: [2, 2, 1, 0, 1, 2] },
    { cat: 'Faculty', vals: [1, 0, 2, 1, 3, 1] },
  ];
  const max = Math.max(...heat.flatMap(h => h.vals));
  const badgeStyle = (s) => ({
    fontSize: 11.5, fontWeight: 600, padding: '4px 11px', borderRadius: 999,
    background: s === 'New' ? tokens.waxSoft : s === 'Resolved' ? tokens.safeSoft : tokens.goldSoft,
    color: s === 'New' ? tokens.waxDeep : s === 'Resolved' ? tokens.safe : tokens.gold,
  });
  return (
    <div className="ech-step" style={{ padding: '44px 24px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 27, color: tokens.ink, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Review queue</h1>
      <p style={{ color: tokens.inkSoft, fontSize: 14, marginBottom: 26 }}>Every echo arrived blind-signed — there's no name to match it to.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 26 }}>
        {[['3', 'Total received'], ['1', 'New'], ['1', 'Under review'], ['1', 'Resolved']].map(([n, l], i) => (
          <div key={l} className="ech-chip" style={{ animationDelay: `${i * 40}ms`, background: tokens.surface, border: `1.5px solid ${tokens.border}`, borderRadius: 14, padding: '17px 18px', boxShadow: '0 4px 14px rgba(27,35,64,0.05)' }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 25, color: tokens.ink }}>{n}</div>
            <div style={{ fontSize: 12, color: tokens.inkFaint, marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="ech-card" style={{ ...cardStyle, marginBottom: 26, padding: 26 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 16.5, color: tokens.ink, marginBottom: 4 }}>Volume by category</div>
        <div style={{ fontSize: 12.5, color: tokens.inkSoft, marginBottom: 18 }}>Darker cells mean more echoes that week.</div>
        <div style={{ display: 'grid', gridTemplateColumns: `104px repeat(${weeks.length},28px)`, gap: 6, alignItems: 'center' }}>
          <div />
          {weeks.map(w => <div key={w} style={{ fontSize: 10, color: tokens.inkFaint, textAlign: 'center' }}>{w}</div>)}
          {heat.map(row => (
            <React.Fragment key={row.cat}>
              <div style={{ fontSize: 12.5, color: tokens.inkSoft, fontWeight: 500 }}>{row.cat}</div>
              {row.vals.map((v, i) => (
                <div key={i} style={{ width: 28, height: 21, borderRadius: 6, border: `1px solid ${tokens.border}`, background: v === 0 ? tokens.paper : `rgba(156,59,38,${0.14 + (v / max) * 0.72})` }} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {rows.map((r, i) => (
        <div key={r.id} className="ech-chip ech-row" style={{ animationDelay: `${i * 45}ms`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 19px', background: tokens.surface, border: `1.5px solid ${tokens.borderSoft}`, borderRadius: 14, marginBottom: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: tokens.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CatIcon name={r.category} color={tokens.waxDeep} />
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: tokens.inkFaint }}>{r.id}</div>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: tokens.ink, marginTop: 2 }}>{r.category}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: tokens.inkFaint }}>{r.time}</span>
            <span style={badgeStyle(r.status)}>{r.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EchoraDemo() {
  useFonts();
  const [view, setView] = useState('verify');
  return (
    <div style={{
      fontFamily: "'Work Sans',sans-serif", background: tokens.paper, backgroundImage: GRAIN,
      borderRadius: 18, overflow: 'hidden', border: `1.5px solid ${tokens.border}`,
    }}>
      <style>{CSS}</style>
      <Nav view={view} setView={setView} />
      {view === 'transparency' && <TransparencyPage key="transparency" />}
      {(view === 'verify' || view === 'otp' || view === 'form' || view === 'done') && <SubmitFlow key="flow" />}
      {view === 'mailbox' && <Mailbox key="mailbox" />}
      {view === 'adminLogin' && <AdminLoginView key="login" onIn={() => setView('adminDash')} />}
      {view === 'adminDash' && <AdminDashboardView key="dash" />}
    </div>
  );
}
