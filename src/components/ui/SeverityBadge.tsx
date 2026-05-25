import React from 'react';

type Severity = 'NORMAL' | 'WARNING' | 'CRITICAL';

interface SeverityBadgeProps { status: Severity; }

const config: Record<Severity, { label: string; color: string; bg: string; dot: string }> = {
  NORMAL:   { label: 'Normal',   color: '#044317', bg: '#defbe6', dot: '#198038' },
  WARNING:  { label: 'Warning',  color: '#6f3600', bg: '#fdf3c1', dot: '#b28600' },
  CRITICAL: { label: 'Critical', color: '#750e13', bg: '#fff1f1', dot: '#da1e28' },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ status }) => {
  const c = config[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', fontSize: 11, fontWeight: 500,
      color: c.color, background: c.bg,
      border: `1px solid ${c.bg}`,
      fontFamily: 'var(--font-body)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
};
