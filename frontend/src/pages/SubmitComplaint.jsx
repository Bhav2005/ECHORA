import React, { useState } from 'react';
import OtpForm from '../components/OtpForm';
import ComplaintForm from '../components/ComplaintForm';
import { tokens } from '../styles/tokens';
import { SealStamp } from '../components/EchoMark';

export default function SubmitComplaint() {
  const [step, setStep] = useState(1);
  const [cryptoTokens, setCryptoTokens] = useState(null);

  const handleVerificationSuccess = (tokens) => {
    setCryptoTokens(tokens);
    setStep(2);
  };

  const handleReset = () => {
    setCryptoTokens(null);
    setStep(1);
  };

  return (
    <div style={{ padding: '44px 24px', maxWidth: 580, margin: '0 auto', minHeight: '80vh' }}>
      <div className="ech-step" style={{ textAlign: 'center', marginBottom: 30 }}>
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 6, 
          fontSize: 12.5, 
          fontWeight: 600, 
          color: tokens.safe, 
          background: tokens.safeSoft, 
          padding: '6px 14px', 
          borderRadius: 999, 
          marginBottom: 16, 
          letterSpacing: '0.01em' 
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
          Heard, not identified
        </span>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 34, color: tokens.ink, margin: '0 0 10px', lineHeight: 1.12, letterSpacing: '-0.01em' }}>
          Send your echo
        </h1>
        <p style={{ color: tokens.inkSoft, fontSize: 15.5, maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
          Say what happened. It reaches the people who can fix it — your name never does.
        </p>
      </div>

      <div className="ech-step" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 30 }}>
        <SealStamp state={step >= 1 ? 'sealed' : 'empty'} size={26} />
        <div style={{ width: 44, height: 2, background: step >= 1 ? tokens.wax : tokens.border, borderRadius: 2, transition: 'background .3s ease' }} />
        <SealStamp state={step >= 2 ? 'sealed' : 'empty'} size={26} />
      </div>

      <div style={{ width: '100%' }}>
        {step === 1 ? (
          <OtpForm onSuccess={handleVerificationSuccess} />
        ) : (
          <ComplaintForm cryptoTokens={cryptoTokens} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
