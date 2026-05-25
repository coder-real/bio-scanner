import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useLiveReading } from '../hooks/useLiveReading';

export const DeviceStatus: React.FC = () => {
  const { device, streamConnected } = useLiveReading();

  const isOnline = device?.status === 'online';

  const timeSincePing = () => {
    if (!device?.lastPing) return 'Never';
    const diff = Math.floor((Date.now() - new Date(device.lastPing).getTime()) / 1000);
    if (diff < 60)  return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="appear">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Device Status</h1>
        <p style={{ fontSize: 13, color: '#525252', marginTop: 2 }}>
          Real-time status of connected BioColour hardware
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, marginBottom: 1 }}>
        {[
          { label: 'TOTAL DEVICES', val: '1',        color: '#161616' },
          { label: 'ONLINE',        val: isOnline ? '1' : '0', color: '#198038' },
          { label: 'OFFLINE',       val: isOnline ? '0' : '1', color: '#da1e28' },
        ].map(s => (
          <Card key={s.label} padding="16px 20px">
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: '#525252', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-mono)', fontWeight: 300, color: s.color }}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* Device detail card */}
      <Card padding="0">
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid #e0e0e0',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#525252', textTransform: 'uppercase' }}>
            Device Registry
          </div>
          {/* Live stream indicator */}
          <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: streamConnected ? '#198038' : '#8d8d8d' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: streamConnected ? '#198038' : '#8d8d8d', display: 'inline-block' }} />
            {streamConnected ? 'Server stream active' : 'Server stream disconnected'}
          </span>
        </div>

        {device ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                {['Device ID', 'Name', 'Type', 'Ward', 'Firmware', 'Last Ping', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 16px',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                    color: '#525252', textTransform: 'uppercase',
                    borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#525252' }}>{device.id}</td>
                <td style={{ padding: '16px 16px', fontSize: 13, fontWeight: 500 }}>{device.name}</td>
                <td style={{ padding: '16px 16px', fontSize: 12, color: '#525252' }}>{device.type}</td>
                <td style={{ padding: '16px 16px', fontSize: 12 }}>{device.ward}</td>
                <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{device.firmware}</td>
                <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#525252' }}>
                  {timeSincePing()}
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <Badge variant={isOnline ? 'success' : 'danger'} dot>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#8d8d8d', fontSize: 13 }}>
            {streamConnected ? 'Loading device data...' : 'Cannot reach server — start the Node server on port 3000.'}
          </div>
        )}
      </Card>

      {/* Last reading details */}
      {device?.lastPing && (
        <Card padding="16px 20px" style={{ marginTop: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#525252', textTransform: 'uppercase', marginBottom: 10 }}>
            Last Communication
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            {new Date(device.lastPing).toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#8d8d8d', marginTop: 4 }}>
            Device automatically marked offline after 15 seconds without a ping.
          </div>
        </Card>
      )}
    </div>
  );
};
