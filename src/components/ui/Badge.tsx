import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  default: { background: '#e0e0e0', color: '#161616' },
  success: { background: '#defbe6', color: '#044317' },
  warning: { background: '#fdf3c1', color: '#6f3600' },
  danger:  { background: '#fff1f1', color: '#750e13' },
  info:    { background: '#edf5ff', color: '#0043ce' },
};

const dots: Record<Variant, string> = {
  default: '#8d8d8d',
  success: '#198038',
  warning: '#b28600',
  danger:  '#da1e28',
  info:    '#0f62fe',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', dot = false }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px',
    fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
    border: `1px solid ${styles[variant].background}`,
    ...styles[variant],
  }}>
    {dot && (
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dots[variant], flexShrink: 0 }} />
    )}
    {children}
  </span>
);
