import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantBase: Record<Variant, React.CSSProperties> = {
  primary:   { background: '#0f62fe', color: '#ffffff', border: '1px solid transparent' },
  secondary: { background: '#ffffff', color: '#0f62fe', border: '1px solid #0f62fe' },
  danger:    { background: '#da1e28', color: '#ffffff', border: '1px solid transparent' },
  ghost:     { background: 'transparent', color: '#0f62fe', border: '1px solid transparent' },
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: 12, height: 32 },
  md: { padding: '8px 16px', fontSize: 14, height: 40 },
  lg: { padding: '11px 24px', fontSize: 15, height: 48 },
};

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', icon, loading = false,
  fullWidth = false, style, disabled, ...rest
}) => (
  <button
    {...rest}
    disabled={disabled || loading}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: 'var(--font-body)', fontWeight: 400, letterSpacing: '0.01em',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      borderRadius: 0,
      transition: 'background 0.1s, filter 0.1s',
      width: fullWidth ? '100%' : undefined,
      ...variantBase[variant],
      ...sizes[size],
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!disabled && !loading) {
        const el = e.currentTarget;
        if (variant === 'primary') el.style.background = '#0353e9';
        else if (variant === 'danger') el.style.background = '#ba1b23';
        else if (variant === 'secondary') el.style.background = '#edf5ff';
        else el.style.background = 'rgba(15,98,254,0.08)';
      }
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget;
      el.style.background = variantBase[variant].background as string;
    }}
  >
    {loading
      ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
      : icon
    }
    {children}
  </button>
);
