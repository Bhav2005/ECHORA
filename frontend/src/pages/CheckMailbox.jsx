import React, { useState } from 'react';
import { checkMailbox, sendMailboxReply } from '../api/complaintApi';
import { SealStamp } from '../components/EchoMark';
import { tokens } from '../styles/tokens';

const COMPLAINT_API_URL = import.meta.env.VITE_COMPLAINT_API_URL || 'http://localhost:3002';

export default function CheckMailbox() {
  const [mailboxId, setMailboxId] = useState('');
  const [mailboxData, setMailboxData] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mailboxId) return;
    setLoading(true);
    setError('');

    try {
      const data = await checkMailbox(mailboxId);
      setMailboxData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Mailbox not found. Verify your ID and try again.');
      setMailboxData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setReplyLoading(true);

    try {
      const data = await sendMailboxReply(mailboxId, newReply);
      setMailboxData(prev => ({
        ...prev,
        replies: [...prev.replies, data.reply]
      }));
      setNewReply('');
    } catch (err) {
      setError('Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  const getStageIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'INVESTIGATING': return 1;
      case 'ESCALATED': return 1;
      case 'RESOLVED': return 2;
      default: return 0;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Echo received';
      case 'INVESTIGATING': return 'Being looked into';
      case 'ESCALATED': return 'Escalated';
      case 'RESOLVED': return 'Resolved';
      default: return status;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const base = { fontSize: 11.5, fontWeight: 600, padding: '4px 11px', borderRadius: 999 };
    switch (status) {
      case 'RESOLVED':
        return { ...base, background: tokens.safeSoft, color: tokens.safe };
      case 'PENDING':
        return { ...base, background: tokens.waxSoft, color: tokens.waxDeep };
      default:
        return { ...base, background: tokens.goldSoft, color: tokens.gold };
    }
  };

  const stages = [
    { title: 'Echo received', desc: 'Your voice landed safely and is waiting in the queue.' },
    { title: 'Being looked into', desc: 'Someone on the review team is active on this.' },
    { title: 'Answered / Resolved', desc: 'A response has been posted below.' },
  ];

  const cardStyle = {
    background: tokens.surface,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: 22,
    padding: 34,
    boxShadow: '0 10px 34px rgba(27,35,64,0.08), 0 2px 8px rgba(27,35,64,0.04)',
  };

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

  return (
    <div style={{ padding: '44px 24px', maxWidth: 800, margin: '0 auto', minHeight: '80vh' }}>
      {!mailboxData ? (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="ech-step" style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 30, color: tokens.ink, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
              Track your echo
            </h1>
            <p style={{ color: tokens.inkSoft, fontSize: 15 }}>
              Enter the ticket ID you saved when you sent it.
            </p>
          </div>
          
          <div className="ech-card" style={cardStyle}>
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
            
            <form onSubmit={handleSearch}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
                TICKET ID
              </label>
              <input 
                className="ech-input" 
                style={{ ...inputStyle, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 18 }} 
                placeholder="box_xxxxxxxxxxxxxxxx" 
                value={mailboxId} 
                onChange={e => setMailboxId(e.target.value)} 
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                className="ech-btn-primary ech-shine" 
                style={loading ? { ...btnPrimary, background: tokens.border, color: tokens.inkFaint } : btnPrimary}
                disabled={loading}
              >
                {loading ? 'Accessing...' : 'Check status'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="ech-step" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setMailboxData(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tokens.inkSoft,
                fontSize: 13.5,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ← Back to search
            </button>
            <span style={getStatusBadgeStyle(mailboxData.complaint.status)}>
              {getStatusLabel(mailboxData.complaint.status)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="md:grid-cols-3">
            {/* Left: Metadata Details */}
            <div style={{
              background: tokens.surface,
              border: `1.5px solid ${tokens.border}`,
              borderRadius: 18,
              padding: 24,
              boxShadow: '0 4px 14px rgba(27,35,64,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              height: 'fit-content'
            }} className="md:col-span-1">
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.inkFaint, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mailbox ID</span>
                <code style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", color: tokens.waxDeep }}>{mailboxId}</code>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.inkFaint, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Category</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: tokens.ink }}>{mailboxData.complaint.category}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.inkFaint, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Context Location</span>
                <span style={{ fontSize: 13, color: tokens.inkSoft }}>
                  {mailboxData.complaint.department} &bull; {mailboxData.complaint.building}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.inkFaint, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Submitted On</span>
                <span style={{ fontSize: 13, color: tokens.inkSoft }}>
                  {new Date(mailboxData.complaint.createdAt || mailboxData.complaint.created_at).toLocaleString()}
                </span>
              </div>
              {mailboxData.complaint.evidence_url && (
                <div>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: tokens.inkFaint, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Evidence Attachment</span>
                  <a
                    href={`${COMPLAINT_API_URL}${mailboxData.complaint.evidence_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      background: tokens.paper,
                      border: `1.5px solid ${tokens.border}`,
                      borderRadius: 8,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: tokens.waxDeep,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = tokens.wax}
                    onMouseLeave={e => e.currentTarget.style.borderColor = tokens.border}
                  >
                    View Attached Evidence File
                  </a>
                </div>
              )}
            </div>

            {/* Right: Timeline & Messaging */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="md:col-span-2">
              
              {/* Stages Timeline */}
              <div className="ech-card" style={{ ...cardStyle, padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {stages.map((s, i) => {
                    const currentStage = getStageIndex(mailboxData.complaint.status);
                    const done = i <= currentStage;
                    const active = i === currentStage;
                    return (
                      <div key={s.title} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                        {i < stages.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: 11,
                            top: 24,
                            bottom: -20,
                            width: 2,
                            background: i < currentStage ? tokens.wax : tokens.border,
                            transition: 'background 0.3s ease'
                          }} />
                        )}
                        <div style={{ zIndex: 1, marginTop: 2 }}>
                          <SealStamp state={done ? 'sealed' : 'empty'} size={24} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: active ? tokens.ink : done ? tokens.inkSoft : tokens.inkFaint }}>
                            {s.title}
                          </div>
                          <div style={{ fontSize: 12.5, color: tokens.inkSoft, marginTop: 2, lineHeight: 1.4 }}>
                            {s.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Tunnel */}
              <div style={{
                background: tokens.surface,
                border: `1.5px solid ${tokens.border}`,
                borderRadius: 18,
                boxShadow: '0 4px 14px rgba(27,35,64,0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: 480,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 20px', background: tokens.paperDeep, borderBottom: `1.5px solid ${tokens.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tokens.ink, letterSpacing: '0.02em' }}>Secure Message Tunnel</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFCF5' }}>
                  {/* Original Grievance Body as the genesis message */}
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '85%', marginRight: 'auto', alignSelf: 'flex-start' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: tokens.inkFaint, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Genesis Grievance Text
                    </div>
                    <div style={{
                      padding: 14,
                      borderRadius: '16px 16px 16px 0px',
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      background: tokens.paper,
                      color: tokens.ink,
                      border: `1px solid ${tokens.border}`,
                    }}>
                      {mailboxData.complaint.content}
                    </div>
                  </div>

                  {mailboxData.replies.map((reply) => {
                    const isAdmin = reply.sender === 'ADMIN';
                    return (
                      <div
                        key={reply.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxWidth: '85%',
                          marginLeft: isAdmin ? '0' : 'auto',
                          marginRight: isAdmin ? 'auto' : '0',
                          alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                          alignItems: isAdmin ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <div style={{ 
                          fontSize: 10, 
                          fontWeight: 600, 
                          color: isAdmin ? tokens.wax : tokens.safe, 
                          marginBottom: 4,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          {isAdmin ? 'Administrator' : 'You (Anonymous)'}
                          <span style={{ color: tokens.inkFaint, textTransform: 'none', fontWeight: 400 }}>
                            &bull; {new Date(reply.createdAt || reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{
                          padding: 14,
                          borderRadius: isAdmin ? '16px 16px 16px 0px' : '16px 16px 0px 16px',
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          background: isAdmin ? tokens.waxSoft : tokens.safeSoft,
                          color: tokens.ink,
                          border: `1px solid ${isAdmin ? tokens.waxSoft : tokens.safeSoft}`,
                        }}>
                          {reply.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} style={{ padding: 14, borderTop: `1.5px solid ${tokens.border}`, background: tokens.paperDeep, display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    required
                    placeholder="Type an anonymous follow-up message..."
                    value={newReply}
                    onChange={e => setNewReply(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: tokens.surface,
                      border: `1.5px solid ${tokens.border}`,
                      borderRadius: 10,
                      fontSize: 13.5,
                      color: tokens.ink,
                      outline: 'none',
                    }}
                    disabled={replyLoading}
                  />
                  <button
                    type="submit"
                    disabled={replyLoading || !newReply.trim()}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      background: tokens.wax,
                      color: '#FCF5EC',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13.5,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {replyLoading ? '...' : 'Send'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
