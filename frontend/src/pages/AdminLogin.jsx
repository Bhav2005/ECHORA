import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/complaintApi';
import { tokens } from '../styles/tokens';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');

    try {
      const data = await adminLogin(username, password);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ padding: '44px 24px', maxWidth: 420, margin: '0 auto', minHeight: '80vh' }}>
      <div className="ech-step" style={{ textAlign: 'center', marginBottom: 26 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 27, color: tokens.ink, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          Admin portal
        </h1>
        <p style={{ color: tokens.inkSoft, fontSize: 14 }}>
          For review team members only.
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

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
            USERNAME
          </label>
          <input 
            type="text"
            required
            className="ech-input" 
            style={{ ...inputStyle, marginBottom: 16 }} 
            placeholder="Username" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
          
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
            PASSWORD
          </label>
          <input 
            type="password" 
            required
            className="ech-input" 
            style={{ ...inputStyle, marginBottom: 22 }} 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <button 
            type="submit" 
            className="ech-btn-primary ech-shine" 
            style={loading ? { ...btnPrimary, background: tokens.border, color: tokens.inkFaint } : btnPrimary}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
