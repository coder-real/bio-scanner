import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ColorSwatch } from '../components/ui/ColorSwatch';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { useLiveReading } from '../hooks/useLiveReading';
import { classifyForMedical, detectColorName } from '../utils/colorClassifier';

export const Dashboard: React.FC = () => {
  const { latest, streamConnected: connected } = useLiveReading();

  const [scanning, setScanning] = React.useState(true);

  // Derive interpreted data from raw RGB
  const colorName = latest ? detectColorName(latest.r, latest.g, latest.b).name : '—';
  const colorHex  = latest ? detectColorName(latest.r, latest.g, latest.b).hex  : '#c8c8c8';
  const interpretations = latest ? classifyForMedical(latest.r, latest.g, latest.b) : [];

  const isLive = connected && scanning;

  return (
    <div className="appear" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

      {/* ── Page header ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e0e0e0',
        marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 0',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: '#161616' }}>
            Live Sensor Reading
          </h1>
          <p style={{ fontSize: 13, color: '#525252', marginTop: 2 }}>
            Continuous spectroscopic analysis across 5 medical domains
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* SSE connection indicator */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: connected ? '#198038' : '#da1e28',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: connected ? '#198038' : '#da1e28',
              display: 'inline-block',
              animation: connected ? 'scan-pulse 1.4s ease-in-out infinite' : 'none',
            }} />
            {connected ? 'LIVE' : 'DISCONNECTED'}
          </span>

          <Button
            variant={scanning ? 'danger' : 'primary'}
            size="sm"
            onClick={() => setScanning(s => !s)}
            icon={scanning
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="3"/><path d="M2 12h3m14 0h3M12 2v3m0 14v3"/></svg>
            }
          >
            {scanning ? 'Pause Display' : 'Resume Display'}
          </Button>
        </div>
      </div>

      {/* ── Scanner panel — full width ── */}
      <Card padding="28px" style={{ marginBottom: 1 }}>
        {latest && isLive ? (
          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
            <ColorSwatch r={latest.r} g={latest.g} b={latest.b} scanning={isLive} colorName={colorName} size={160} />

            <div style={{ flex: 1 }}>
              {/* RGB grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #e0e0e0', marginBottom: 20 }}>
                {([['R', latest.r, '#da1e28'], ['G', latest.g, '#198038'], ['B', latest.b, '#0f62fe']] as const).map(([ch, val, color], i) => (
                  <div key={ch} style={{
                    padding: '16px 20px', textAlign: 'center',
                    borderRight: i < 2 ? '1px solid #e0e0e0' : 'none',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.12em', marginBottom: 8 }}>{ch}</div>
                    <div style={{ fontSize: 40, fontWeight: 300, fontFamily: 'var(--font-mono)', color: '#161616', lineHeight: 1 }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 1 }}>
                <div style={{ flex: 1, padding: '10px 14px', background: '#f4f4f4', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: 9, color: '#8d8d8d', letterSpacing: '0.08em', marginBottom: 3 }}>DETECTED COLOUR</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{colorName}</div>
                </div>
                <div style={{ flex: 1, padding: '10px 14px', background: '#f4f4f4', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: 9, color: '#8d8d8d', letterSpacing: '0.08em', marginBottom: 3 }}>HEX VALUE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 14, height: 14, background: colorHex, border: '1px solid #ccc' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{colorHex}</span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: '10px 14px', background: '#f4f4f4', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: 9, color: '#8d8d8d', letterSpacing: '0.08em', marginBottom: 3 }}>TIME</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    {new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Waiting state */
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#8d8d8d' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.25 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                <circle cx="12" cy="12" r="3"/><path d="M2 12h3m14 0h3M12 2v3m0 14v3"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>
              {connected ? (scanning ? 'Awaiting first reading from device...' : 'Display paused') : 'Connecting to server...'}
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {connected ? 'Server connected · Waiting for ESP-01S data' : 'Check that the Node server is running on port 3000'}
            </div>
          </div>
        )}
      </Card>

      {/* ── Medical Interpretations table — full width ── */}
      <Card padding="0">
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '11px 16px', borderBottom: '1px solid #e0e0e0',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', color: '#525252', textTransform: 'uppercase' }}>
            Medical Colour Interpretations
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#8d8d8d' }}>
            {interpretations.length} match{interpretations.length !== 1 ? 'es' : ''} found
          </span>
        </div>

        {interpretations.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                {['S/N', 'Application Domain', 'Detected Colour', 'Biomedical Interpretation', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 16px',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                    color: '#525252', textTransform: 'uppercase',
                    borderBottom: '1px solid #e0e0e0',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interpretations.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: '#8d8d8d', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 500 }}>{row.application}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 14, height: 14, background: row.colorHex, border: '1px solid #e0e0e0', flexShrink: 0 }} />
                      <span style={{ fontSize: 13 }}>{row.detectedColor}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#525252' }}>{row.interpretation}</td>
                  <td style={{ padding: '13px 16px' }}><SeverityBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8d8d8d', fontSize: 13 }}>
            {connected ? 'Awaiting colour data to display interpretations.' : 'No server connection — check that the server is running.'}
          </div>
        )}
      </Card>
    </div>
  );
};
