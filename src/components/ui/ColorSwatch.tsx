import React from 'react';

interface ColorSwatchProps { r: number; g: number; b: number; scanning?: boolean; colorName?: string; size?: number; }

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ r, g, b, scanning = false, colorName, size = 160 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div
      className={scanning ? 'swatch-active' : ''}
      style={{
        width: size, height: size,
        background: `rgb(${r},${g},${b})`,
        transition: 'background 0.9s cubic-bezier(0.4,0,0.2,1)',
        border: '1px solid var(--color-border-subtle)',
        outline: scanning ? '1px solid rgba(15,98,254,0.4)' : 'none',
        outlineOffset: 3,
      }}
    />
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}>
        RGB({r}, {g}, {b})
      </div>
      {colorName && (
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {colorName}
        </div>
      )}
    </div>
  </div>
);
