import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SeverityBadge } from '../components/ui/SeverityBadge';

// Reference table from spec
const COLOUR_REFS = [
  { sn: 1, app: 'Blood Sample Analysis',        colour: 'Bright Red',   meaning: 'Normal oxygenated blood',                 status: 'NORMAL'   as const },
  { sn: 1, app: 'Blood Sample Analysis',        colour: 'Dark Red',     meaning: 'Low oxygen level or venous blood',         status: 'WARNING'  as const },
  { sn: 2, app: 'Urine Test Strip Analysis',    colour: 'Yellow',       meaning: 'Normal urine condition',                  status: 'NORMAL'   as const },
  { sn: 2, app: 'Urine Test Strip Analysis',    colour: 'Red / Pink',   meaning: 'Presence of blood in urine',              status: 'CRITICAL' as const },
  { sn: 2, app: 'Urine Test Strip Analysis',    colour: 'Greenish',     meaning: 'Possible infection',                      status: 'CRITICAL' as const },
  { sn: 3, app: 'Skin Disease Detection',       colour: 'Pale White',   meaning: 'Poor blood circulation or anaemia',       status: 'WARNING'  as const },
  { sn: 3, app: 'Skin Disease Detection',       colour: 'Dark Brown / Black', meaning: 'Possible skin lesion or melanoma', status: 'CRITICAL' as const },
  { sn: 4, app: 'Wound Monitoring System',      colour: 'Pink',         meaning: 'Healthy healing tissue',                  status: 'NORMAL'   as const },
  { sn: 4, app: 'Wound Monitoring System',      colour: 'Red',          meaning: 'Infected or inflamed wound',              status: 'CRITICAL' as const },
  { sn: 4, app: 'Wound Monitoring System',      colour: 'Black',        meaning: 'Dead tissue (necrosis)',                  status: 'CRITICAL' as const },
  { sn: 5, app: 'pH & Diagnostic Strip',        colour: 'Blue',         meaning: 'Alkaline condition',                      status: 'NORMAL'   as const },
  { sn: 5, app: 'pH & Diagnostic Strip',        colour: 'Green',        meaning: 'Neutral condition',                       status: 'NORMAL'   as const },
  { sn: 5, app: 'pH & Diagnostic Strip',        colour: 'Yellow / Orange', meaning: 'Acidic condition',                    status: 'WARNING'  as const },
];

const COLOUR_HEX: Record<string, string> = {
  'Bright Red': '#DC2626', 'Dark Red': '#7F1D1D', 'Yellow': '#FBBF24',
  'Red / Pink': '#F87171', 'Greenish': '#6EE7B7', 'Pale White': '#F3F4F6',
  'Dark Brown / Black': '#1C0A00', 'Pink': '#FCA5A5', 'Red': '#EF4444',
  'Black': '#111827', 'Blue': '#3B82F6', 'Green': '#22C55E', 'Yellow / Orange': '#F59E0B',
};

const mockReports = [
  { id: 'RPT-031', patient: 'John Doe',       date: '2026-05-23', type: 'Blood Sample Analysis',     colourDetected: 'Bright Red', status: 'NORMAL'   as const },
  { id: 'RPT-030', patient: 'Sarah Mitchell', date: '2026-05-22', type: 'Urine Test Strip Analysis', colourDetected: 'Greenish',   status: 'CRITICAL' as const },
  { id: 'RPT-029', patient: 'Robert Chen',    date: '2026-05-21', type: 'pH & Diagnostic Strip',     colourDetected: 'Yellow / Orange', status: 'WARNING' as const },
  { id: 'RPT-028', patient: 'Amara Osei',     date: '2026-05-20', type: 'Wound Monitoring System',   colourDetected: 'Pink',       status: 'NORMAL'   as const },
  { id: 'RPT-027', patient: 'Robert Chen',    date: '2026-05-19', type: 'Skin Disease Detection',    colourDetected: 'Pale White', status: 'WARNING'  as const },
];

export const Reports: React.FC = () => {
  const counts = {
    total: mockReports.length,
    normal: mockReports.filter(r => r.status === 'NORMAL').length,
    warning: mockReports.filter(r => r.status === 'WARNING').length,
    critical: mockReports.filter(r => r.status === 'CRITICAL').length,
  };

  return (
    <div className="appear">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Reports</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
          Scan analysis reports and colour reference library
        </p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, marginBottom: 1 }}>
        {[
          { label: 'TOTAL REPORTS', val: counts.total, color: 'var(--color-text-primary)' },
          { label: 'NORMAL', val: counts.normal, color: '#198038' },
          { label: 'WARNING', val: counts.warning, color: '#b28600' },
          { label: 'CRITICAL', val: counts.critical, color: '#da1e28' },
        ].map(s => (
          <Card key={s.label} padding="16px 20px">
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontFamily: 'var(--font-mono)', fontWeight: 300, color: s.color }}>{s.val}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 1 }}>
        {/* Recent reports */}
        <Card padding="0">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Recent Reports
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                {['Report ID', 'Patient', 'Application', 'Colour Detected', 'Date', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockReports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-interactive)' }}>{r.id}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13 }}>{r.patient}</td>
                  <td style={{ padding: '13px 16px', fontSize: 12 }}>{r.type}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 12, height: 12, background: COLOUR_HEX[r.colourDetected] ?? '#ccc', border: '1px solid var(--color-border-subtle)', flexShrink: 0 }} />
                      <span style={{ fontSize: 12 }}>{r.colourDetected}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{r.date}</td>
                  <td style={{ padding: '13px 16px' }}><SeverityBadge status={r.status} /></td>
                  <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-interactive)', fontSize: 12, fontFamily: 'var(--font-body)', padding: 0 }}>Export ↗</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Colour reference library */}
        <Card padding="0">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Colour Reference Library
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                {['Colour', 'Application', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '7px 14px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLOUR_REFS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 12, height: 12, background: COLOUR_HEX[r.colour] ?? '#ccc', border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 500 }}>{r.colour}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.app.replace(' Analysis', '').replace(' System', '').replace(' Detection', '').replace(' Monitoring', '')}</td>
                  <td style={{ padding: '10px 14px' }}><SeverityBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
