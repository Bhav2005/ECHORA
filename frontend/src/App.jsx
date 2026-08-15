import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import SubmitComplaint from './pages/SubmitComplaint';
import CheckMailbox from './pages/CheckMailbox';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TransparencyPage from './pages/TransparencyPage';
import { EchoMark } from './components/EchoMark';
import { tokens } from './styles/tokens';

function Navigation() {
  const location = useLocation();
  const isAdminToken = !!localStorage.getItem('adminToken');
  const view = location.pathname;

  const link = (path, label, primary = false) => {
    const isActive = view === path;
    
    return (
      <Link 
        to={path} 
        className="ech-nav-link" 
        style={{
          fontFamily: "'Work Sans',sans-serif", 
          fontSize: 13.5, 
          fontWeight: 500,
          padding: '9px 17px', 
          borderRadius: 999, 
          cursor: 'pointer',
          display: 'inline-block',
          textAlign: 'center',
          transition: 'background .18s ease, color .18s ease, transform .12s ease',
          background: primary ? tokens.wax : (isActive ? tokens.waxSoft : 'transparent'),
          color: primary ? '#FCF5EC' : (isActive ? tokens.waxDeep : tokens.inkSoft),
          boxShadow: primary ? '0 4px 10px rgba(156,59,38,0.2)' : 'none',
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '17px 26px',
      background: tokens.paper, 
      borderBottom: `1.5px solid ${tokens.border}`, 
      borderRadius: '18px 18px 0 0',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <EchoMark animate />
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 19, color: tokens.ink, lineHeight: 1 }}>Echora</div>
          <div style={{ fontFamily: "'Work Sans',sans-serif", fontSize: 10.5, color: tokens.inkFaint, letterSpacing: '0.04em', marginTop: 2 }}>SEALED &amp; UNTRACEABLE</div>
        </div>
      </Link>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {link('/transparency', 'Transparency')}
        {link('/mailbox', 'Track your echo')}
        {link(isAdminToken ? "/admin/dashboard" : "/admin/login", 'Admin portal')}
        {link('/', 'Send an echo', true)}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div 
        className="flex flex-col min-h-screen" 
        style={{ 
          fontFamily: "'Work Sans',sans-serif", 
          background: tokens.paper,
          color: tokens.ink,
        }}
      >
        <Navigation />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SubmitComplaint />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/mailbox" element={<CheckMailbox />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <footer style={{
          padding: '24px',
          borderTop: `1.5px solid ${tokens.border}`,
          textAlign: 'center',
          fontSize: '11px',
          color: tokens.inkSoft,
          letterSpacing: '0.02em',
        }}>
          <div className="container mx-auto">
            Echora Grievance System &bull; Cryptographically Anonymous but Verifiable Affiliation
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
