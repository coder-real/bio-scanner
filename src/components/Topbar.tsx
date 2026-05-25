import React from 'react';
import { useLiveReading } from '../hooks/useLiveReading';

export const Topbar: React.FC = () => {
  const { device, streamConnected } = useLiveReading();

  // Device is truly online only if server stream is up AND device sent a ping recently
  const deviceOnline = streamConnected && device?.status === 'online';
  const statusLabel  = !streamConnected ? 'Server Offline' : deviceOnline ? 'Device Online' : 'Device Offline';
  const statusColor  = !streamConnected ? '#8d8d8d' : deviceOnline ? '#198038' : '#da1e28';

  return (
    <header style={{
      height: 48, background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0, zIndex: 10,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="/JOSTUM logo.png"
          alt="JOSTUM"
          style={{ height: 28, width: 'auto', objectFit: 'contain', display: 'block' }}
        />
        <span style={{
          fontSize: 10, color: '#525252', background: '#f4f4f4',
          padding: '1px 6px', border: '1px solid #e0e0e0',
          letterSpacing: '0.06em',
        }}>SPECTRAL ANALYSIS</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Real-time device status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: statusColor,
          display: 'inline-block',
          animation: deviceOnline ? 'scan-pulse 1.4s ease-in-out infinite' : 'none',
        }} />
        <span style={{ fontSize: 12, color: '#525252', letterSpacing: '0.02em' }}>
          {statusLabel}
        </span>
      </div>
    </header>
  );
};
