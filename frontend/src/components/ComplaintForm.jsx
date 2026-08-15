import React, { useState, useEffect, useRef } from 'react';
import { submitComplaint } from '../api/complaintApi';
import { SealStamp } from './EchoMark';
import { tokens } from '../styles/tokens';

const CATEGORIES = [
  'Academics',
  'Harassment',
  'Hostel & Facilities',
  'Faculty conduct',
  'Finance & fees',
  'Safety',
  'Discrimination',
  'Other'
];

const DEPARTMENTS = [
  'General',
  'Student Affairs',
  'Administration',
  'Computer Science & Engineering',
  'Mechanical & Civil Engineering',
  'Science',
  'Arts & Humanities',
  'Finance',
  'Human Resources',
  'Security',
  'Library Services'
];

const BUILDINGS = [
  'Not applicable',
  'Academic Block',
  'Admin Block',
  'Hostel Block A',
  'Hostel Block B',
  'Hostel Block C',
  'Library',
  'Sports Complex',
  'Cafeteria',
  'Off-campus'
];

// Minimal category icons from demo
function CatIcon({ name, color }) {
  const p = { stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const icons = {
    'Academics': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M4 6.5l6-2.5 6 2.5-6 2.5-6-2.5z M4 6.5v5c0 1 2.5 2 6 2s6-1 6-2v-5" {...p} /></svg>,
    'Harassment': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 2.5l6 2.5v4c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8v-4l6-2.5z M10 9v3" {...p} /></svg>,
    'Hostel & Facilities': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M3 10l7-6 7 6 M5 9v6.5h10V9" {...p} /></svg>,
    'Faculty conduct': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M4.5 16c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" {...p} /></svg>,
    'Finance & fees': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 3v14 M13.5 6.2c0-1.2-1.6-2.2-3.5-2.2s-3.5 1-3.5 2.2 1.6 1.8 3.5 1.8 3.5.7 3.5 1.9-1.6 2.1-3.5 2.1-3.5-.9-3.5-2.1" {...p} /></svg>,
    'Safety': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 2.5l6 2.5v4c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8v-4l6-2.5z M7.3 10l1.8 1.8 3.6-3.6" {...p} /></svg>,
    'Discrimination': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 3v13 M4 16h12 M5.5 7l-2.5 5h5l-2.5-5z M14.5 7L12 12h5l-2.5-5z M10 3l-4.5 4M10 3l4.5 4" {...p} /></svg>,
    'Other': <svg width="18" height="18" viewBox="0 0 20 20"><path d="M6 10a1.1 1.1 0 1 1-2.2 0A1.1 1.1 0 0 1 6 10z M11.1 10a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z M16.2 10a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z" fill={color} stroke="none" /></svg>,
  };
  return icons[name] || icons['Other'];
}

export default function ComplaintForm({ cryptoTokens, onReset }) {
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [building, setBuilding] = useState(BUILDINGS[0]);
  const [content, setContent] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [mailboxId, setMailboxId] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  const fileInputRef = useRef(null);

  // Generate random 16-character hex Mailbox ID on mount
  useEffect(() => {
    const randomHex = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    setMailboxId(`box_${randomHex}`);
  }, []);

  const handleCopyMailbox = () => {
    navigator.clipboard.writeText(mailboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !category) return;

    if (!cryptoTokens?.tokenMessage || !cryptoTokens?.tokenSignature) {
      setError('Your anonymous verification token is missing or expired. Please restart the verification.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('category', category);
    formData.append('department', department);
    formData.append('building', building);
    formData.append('content', content + (urgent ? '\n\n[URGENT ATTENTION FLAG ACTIVATED]' : ''));
    formData.append('tokenMessage', cryptoTokens.tokenMessage);
    formData.append('tokenSignature', cryptoTokens.tokenSignature);
    formData.append('mailboxId', mailboxId);
    if (evidence) {
      formData.append('evidence', evidence);
    }

    try {
      const result = await submitComplaint(formData);
      setSuccessData({
        complaintId: result.complaintId,
        mailboxId: result.mailboxId
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint. Please verify your anonymous token and try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => setEvidence(null);
  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const inputStyle = {
    width: '100%', 
    padding: '13px 15px', 
    fontFamily: "'Work Sans',sans-serif", 
    fontSize: 14.5,
    color: tokens.ink, 
    background: tokens.paper, 
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 10, 
    outline: 'none', 
    boxSizing: 'border-box',
  };

  const btnPrimary = {
    width: '100%', 
    padding: '14px 20px', 
    borderRadius: 10, 
    border: 'none',
    fontSize: 15, 
    fontWeight: 600, 
    background: tokens.wax, 
    color: '#FCF5EC', 
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'all 0.2s ease',
  };

  const cardStyle = {
    background: tokens.surface, 
    border: `1.5px solid ${tokens.border}`, 
    borderRadius: 22,
    padding: 34, 
    boxShadow: '0 10px 34px rgba(27,35,64,0.08), 0 2px 8px rgba(27,35,64,0.04)',
  };

  if (successData) {
    return (
      <div className="w-full max-w-xl mx-auto" style={{ animation: 'stepEnter 0.4s ease' }}>
        <div className="ech-card" style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <SealStamp state="sealed" size={76} pop />
            </div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: tokens.ink, margin: '0 0 6px' }}>
              Your echo is out there
            </h2>
            <p style={{ color: tokens.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>
              Save this ID — it's the only way to follow up. We cannot recover it for you.
            </p>
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono',monospace", 
            fontSize: 20, 
            textAlign: 'center', 
            background: tokens.paper,
            border: `1.5px dashed ${tokens.wax}`, 
            borderRadius: 12, 
            padding: '18px 10px', 
            marginBottom: 20, 
            letterSpacing: '0.04em', 
            color: tokens.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}>
            <span style={{ selectAll: 'all' }}>{successData.mailboxId}</span>
            <button
              onClick={handleCopyMailbox}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tokens.wax,
                fontSize: 14,
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 6,
                backgroundColor: tokens.waxSoft,
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button className="ech-btn-primary" style={btnPrimary} onClick={onReset}>
            Send another
          </button>
        </div>
      </div>
    );
  }

  const ready = category && content.length >= 10;
  const needsCategory = !category;
  const needsDetail = content.length < 10;

  return (
    <div className="w-full max-w-xl mx-auto" style={{ animation: 'stepEnter 0.4s ease' }}>
      <div className="ech-card" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: tokens.ink, margin: '0 0 6px' }}>
            Share your grievance
          </h2>
          <p style={{ color: tokens.inkSoft, fontSize: 13.5 }}>
            Your name and email are never attached to this.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#B4453A', 
            fontSize: 13.5, 
            padding: '12px 16px', 
            borderRadius: 10, 
            marginBottom: 18,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 9, letterSpacing: '0.01em' }}>
            CATEGORY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 9, marginBottom: 20 }}>
            {CATEGORIES.map((c, i) => {
              const active = category === c;
              return (
                <button 
                  key={c} 
                  type="button"
                  className="ech-chip ech-chip-btn" 
                  style={{ animationDelay: `${i * 35}ms`, border: 'none', background: 'none', padding: 0 }} 
                  onClick={() => setCategory(c)}
                >
                  <span style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '11px 12px', 
                    borderRadius: 10, 
                    fontSize: 13, 
                    fontWeight: 500, 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    width: '100%',
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

          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
            DEPARTMENT / FACULTY
          </label>
          <select
            className="ech-input"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            style={{ 
              ...inputStyle, 
              marginBottom: 20, 
              appearance: 'none', 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A90A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'right 14px center', 
              cursor: 'pointer' 
            }}
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
            WHICH BUILDING / LOCATION
          </label>
          <select
            className="ech-input"
            value={building}
            onChange={e => setBuilding(e.target.value)}
            style={{ 
              ...inputStyle, 
              marginBottom: 20, 
              appearance: 'none', 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A90A8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'right 14px center', 
              cursor: 'pointer' 
            }}
          >
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
            WHAT HAPPENED
          </label>
          <textarea 
            className="ech-input" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Describe the situation — what, where, when."
            required
            style={{ ...inputStyle, minHeight: 108, marginBottom: 20, fontFamily: "'Work Sans',sans-serif", lineHeight: 1.5 }} 
          />

          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
            ATTACH EVIDENCE <span style={{ fontWeight: 400, color: tokens.inkFaint, textTransform: 'none', letterSpacing: 0 }}>(optional — photo, screenshot, pdf)</span>
          </label>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*,.pdf,.doc,.docx" 
            style={{ display: 'none' }} 
            onChange={e => { 
              if(e.target.files.length) {
                setEvidence(e.target.files[0]);
              }
              e.target.value = ''; 
            }} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%', 
              padding: '16px', 
              borderRadius: 10, 
              border: `1.5px dashed ${tokens.border}`,
              background: tokens.paper, 
              color: tokens.inkSoft, 
              fontFamily: "'Work Sans',sans-serif", 
              fontSize: 13.5,
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              marginBottom: evidence ? 10 : 20,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 18v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke={tokens.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Click to attach evidence file
          </button>
          
          {evidence && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="ech-chip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: tokens.paper, border: `1px solid ${tokens.border}`, borderRadius: 8 }}>
                <span style={{ fontSize: 12.5, color: tokens.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evidence.name} <span style={{ color: tokens.inkFaint }}>· {formatSize(evidence.size)}</span>
                </span>
                <button type="button" onClick={removeFile} style={{ border: 'none', background: 'none', cursor: 'pointer', color: tokens.inkFaint, fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setUrgent(u => !u)}
            style={{
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              textAlign: 'left', 
              cursor: 'pointer',
              padding: '13px 15px', 
              borderRadius: 10, 
              marginBottom: 20,
              border: `1.5px solid ${urgent ? '#B4453A' : tokens.border}`,
              background: urgent ? '#FBEAE7' : tokens.paper,
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{
              width: 20, 
              height: 20, 
              borderRadius: 6, 
              flexShrink: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: `1.5px solid ${urgent ? '#B4453A' : tokens.inkFaint}`, 
              background: urgent ? '#B4453A' : 'transparent',
            }}>
              {urgent && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <span>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: urgent ? '#B4453A' : tokens.ink }}>This needs urgent attention</div>
              <div style={{ fontSize: 12, color: tokens.inkSoft, marginTop: 1 }}>Immediate safety risk — flagged echoes get reviewed first.</div>
            </span>
          </button>

          <p style={{ fontSize: 12, color: ready ? tokens.safe : tokens.inkFaint, margin: '0 0 18px', minHeight: 16, textAlign: 'center' }}>
            {ready
              ? 'Ready to send.'
              : needsCategory && needsDetail
                ? 'Pick a category and add details (min 10 chars) to send.'
                : needsCategory
                  ? 'Pick a category above to send.'
                  : `Add detail — ${10 - content.length} more character${10 - content.length === 1 ? '' : 's'} to go.`}
          </p>

          <button
            type="submit"
            disabled={!ready || loading}
            className={ready ? 'ech-btn-primary ech-shine' : ''}
            style={ready && !loading ? btnPrimary : { ...btnPrimary, background: tokens.border, color: tokens.inkFaint, cursor: 'not-allowed' }}
          >
            {loading ? 'Sealing...' : 'Seal and send my echo'}
          </button>
        </form>
      </div>
    </div>
  );
}
