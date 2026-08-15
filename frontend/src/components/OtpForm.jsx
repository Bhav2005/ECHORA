import React, { useState, useRef, useEffect } from 'react';
import { requestOtp, verifyOtp, getPublicKey, requestSignature } from '../api/identityApi';
import { getRandomBigInt, blindMessage, unblindSignature } from '../crypto/blindSignature.client';
import { SealStamp } from './EchoMark';
import { tokens } from '../styles/tokens';

// Tactical envelope graphic from demo
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

export default function OtpForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP
  const [otpStatus, setOtpStatus] = useState('idle'); // 'idle' | 'pressed' | 'sealed'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
  const inputsRef = useRef([]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      await requestOtp(email);
      setStep(2);
      setInfoMessage('A verification code has been logged to your server console (development mode) or sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to request verification code. Please check rate limits.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndSignToken = async (otpCode) => {
    setLoading(true);
    setError('');
    setOtpStatus('pressed');

    try {
      // 1. Verify OTP and get temporary session token
      const verifyRes = await verifyOtp(email, otpCode);
      const sessionToken = verifyRes.token;

      setInfoMessage('Generating cryptographic token...');

      // 2. Client-side Blind Signature Cryptography
      const keyInfo = await getPublicKey();

      // Generate a random 256-bit BigInt as our token message M
      const tokenMessageBigInt = getRandomBigInt(32);
      const tokenMessageHex = tokenMessageBigInt.toString(16);

      // Blind the message M: T = (M * r^e) % N
      const { blindedMessageHex, blindingFactor } = blindMessage(tokenMessageBigInt, keyInfo);

      setInfoMessage('Signing blinded token securely...');

      // Request Identity Service signature on the blinded message T
      const signRes = await requestSignature(sessionToken, blindedMessageHex);
      const signedBlindedHex = signRes.signature;

      setInfoMessage('Unblinding token signature locally...');

      // Unblind signature client-side: S = (S' * r^-1) % N
      const tokenSignatureHex = unblindSignature(signedBlindedHex, blindingFactor, keyInfo);

      setOtpStatus('sealed');
      setInfoMessage('Signature obtained successfully!');

      // Decoupled from identity! Callback parent
      setTimeout(() => {
        onSuccess({
          tokenMessage: tokenMessageHex,
          tokenSignature: tokenSignatureHex,
        });
      }, 600);

    } catch (err) {
      setOtpStatus('idle');
      setDigits(Array(6).fill(''));
      inputsRef.current[0]?.focus();
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigit = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    
    // Auto-focus next input
    if (val && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }
    
    // Trigger verify when all digits are filled
    if (next.every(d => d !== '')) {
      const codeString = next.join('');
      verifyAndSignToken(codeString);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      inputsRef.current[i - 1]?.focus();
    }
  };

  // Focus helper
  useEffect(() => {
    if (step === 2 && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [step]);

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

  const btnGhost = {
    width: '100%', 
    padding: '13px 20px', 
    borderRadius: 10, 
    fontSize: 14, 
    fontWeight: 500,
    background: 'transparent', 
    border: `1.5px solid ${tokens.border}`, 
    color: tokens.inkSoft, 
    cursor: 'pointer', 
    marginTop: 10,
    transition: 'all 0.2s ease',
  };

  return (
    <div className="w-full max-w-md mx-auto" style={{ animation: 'stepEnter 0.4s ease' }}>
      {step === 1 && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <EnvelopeHero />
        </div>
      )}

      <div className="ech-card" style={{
        background: tokens.surface, 
        border: `1.5px solid ${tokens.border}`, 
        borderRadius: 22,
        padding: 34, 
        boxShadow: '0 10px 34px rgba(27,35,64,0.08), 0 2px 8px rgba(27,35,64,0.04)',
      }}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#B4453A', 
            fontSize: 13.5, 
            padding: '12px 16px', 
            borderRadius: 10, 
            marginBottom: 18,
            lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        {infoMessage && !error && (
          <div style={{
            background: tokens.goldSoft, 
            border: `1px solid ${tokens.gold}`, 
            color: tokens.ink, 
            fontSize: 13.5, 
            padding: '12px 16px', 
            borderRadius: 10, 
            marginBottom: 18,
            lineHeight: 1.4,
          }}>
            {infoMessage}
          </div>
        )}

        {step === 1 ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: tokens.ink, margin: '0 0 6px' }}>
                Prove you belong here
              </h2>
              <p style={{ color: tokens.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>
                We check your email's domain, then forget the email. No name, no inbox record.
              </p>
            </div>
            <form onSubmit={handleRequestOtp}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: tokens.ink, marginBottom: 7, letterSpacing: '0.01em' }}>
                INSTITUTIONAL EMAIL ADDRESS
              </label>
              <input 
                type="email"
                required
                className="ech-input" 
                style={{ ...inputStyle, marginBottom: 18 }} 
                placeholder="you@institution.edu" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !email}
                className="ech-btn-primary ech-shine" 
                style={loading ? { ...btnPrimary, background: tokens.border, color: tokens.inkFaint, cursor: 'not-allowed' } : btnPrimary}
              >
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <SealStamp 
                  state={otpStatus === 'sealed' ? 'sealed' : otpStatus === 'pressed' ? 'pressed' : 'empty'} 
                  pop={otpStatus === 'sealed'} 
                />
              </div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 21, color: tokens.ink, margin: '0 0 6px' }}>
                Enter your code
              </h2>
              <p style={{ color: tokens.inkSoft, fontSize: 13.5 }}>
                Sent to {email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginBottom: 18 }}>
              {digits.map((d, i) => (
                <input 
                  key={i} 
                  className="ech-otp" 
                  ref={el => (inputsRef.current[i] = el)} 
                  maxLength={1} 
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                  style={{ 
                    ...inputStyle, 
                    width: 44, 
                    height: 54, 
                    textAlign: 'center', 
                    fontFamily: "'IBM Plex Mono',monospace", 
                    fontSize: 19, 
                    padding: 0, 
                    fontWeight: 500,
                  }} 
                />
              ))}
            </div>
            <button 
              className="ech-btn-ghost" 
              style={btnGhost} 
              onClick={() => {
                setStep(1);
                setDigits(Array(6).fill(''));
                setOtpStatus('idle');
                setError('');
                setInfoMessage('');
              }}
              disabled={loading}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
