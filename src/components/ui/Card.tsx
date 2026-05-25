import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  padding?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children, style, className, padding = '16px', onClick, interactive = false,
}) => (
  <div
    className={className}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    style={{
      background: 'var(--color-layer-01)',
      border: '1px solid var(--color-border-subtle)',
      padding,
      cursor: (onClick || interactive) ? 'pointer' : undefined,
      transition: 'border-color 0.15s, background 0.15s',
      ...style,
    }}
    onMouseEnter={(onClick || interactive) ? (e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-strong)';
    } : undefined}
    onMouseLeave={(onClick || interactive) ? (e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-subtle)';
    } : undefined}
  >
    {children}
  </div>
);
