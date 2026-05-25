import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem { label: string; path: string; end?: boolean; icon: React.ReactNode; }

const NAV: NavItem[] = [
  {
    label: 'Dashboard', path: '/', end: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="3"/><path d="M2 12h3m14 0h3M12 2v3m0 14v3"/></svg>,
  },
  {
    label: 'Device Status', path: '/device-status',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="3" width="20" height="14" rx="0"/><path d="M8 21h8M12 17v4"/></svg>,
  },
];

export const Sidebar: React.FC = () => {
  const link = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px',
    color: active ? '#ffffff' : '#8d8d8d',
    background: active ? '#393939' : 'transparent',
    textDecoration: 'none', fontSize: 14, fontWeight: active ? 500 : 400,
    borderLeft: active ? '3px solid #0f62fe' : '3px solid transparent',
    transition: 'all 0.1s',
    cursor: 'pointer',
    lineHeight: 1.2,
  });

  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background: '#161616',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #393939',
    }}>
      {/* JOSTUM Brand */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #393939' }}>
        <img
          src="/JOSTUM logo.png"
          alt="JOSTUM"
          style={{ height: 36, width: 'auto', display: 'block', objectFit: 'contain' }}
        />
        <div style={{ color: '#525252', fontSize: 10, letterSpacing: '0.06em', marginTop: 6 }}>MEDICAL IoT</div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 4 }}>
        {NAV.map((item) => (
          <NavLink
            key={item.path} to={item.path} end={item.end}
            style={({ isActive }) => link(isActive)}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (!el.getAttribute('aria-current')) {
                el.style.background = '#262626';
                el.style.color = '#f4f4f4';
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              if (!el.getAttribute('aria-current')) {
                el.style.background = 'transparent';
                el.style.color = '#8d8d8d';
              }
            }}
          >
            <span style={{ flexShrink: 0, opacity: 0.8 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Version tag */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #393939' }}>
        <div style={{ fontSize: 10, color: '#525252', letterSpacing: '0.06em' }}>BioScan Pro v2.4</div>
        <div style={{ fontSize: 10, color: '#393939', marginTop: 2 }}>TCS3200 Spectroscope</div>
      </div>
    </aside>
  );
};
