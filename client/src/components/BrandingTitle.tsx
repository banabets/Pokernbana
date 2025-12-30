import React from 'react';
import BRANDING from '../branding';

interface BrandingTitleProps {
  showSubtitle?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
}

export const BrandingTitle: React.FC<BrandingTitleProps> = ({
  showSubtitle = true,
  className = '',
  size = 'medium',
  style = {}
}) => {
  const sizeStyles = {
    small: {
      title: { fontSize: '16px', fontWeight: '600' },
      subtitle: { fontSize: '10px', fontWeight: '400' }
    },
    medium: {
      title: { fontSize: '22px', fontWeight: '700' },
      subtitle: { fontSize: '12px', fontWeight: '400' }
    },
    large: {
      title: { fontSize: '32px', fontWeight: '800' },
      subtitle: { fontSize: '12px', fontWeight: '400' }
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`branding-title ${className}`} style={{ position: 'relative', ...style }}>
      {/* Efecto de reflectores de luz desde arriba - Rayos de luz */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '0',
        right: '0',
        height: '200px',
        background: `
          conic-gradient(from 0deg at 25% 0%, transparent 0deg, rgba(255,255,255,0.3) 5deg, transparent 10deg),
          conic-gradient(from 0deg at 50% 0%, transparent 0deg, rgba(255,255,255,0.4) 8deg, transparent 16deg),
          conic-gradient(from 0deg at 75% 0%, transparent 0deg, rgba(255,255,255,0.3) 5deg, transparent 10deg)
        `,
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'spotlightPulse 4s ease-in-out infinite',
        filter: 'blur(2px)'
      }} />
      {/* Rayos de luz más intensos */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120%',
        height: '150px',
        background: `
          radial-gradient(ellipse 60% 30% at 30% 0%, rgba(255,255,255,0.25) 0%, transparent 60%),
          radial-gradient(ellipse 60% 30% at 50% 0%, rgba(255,255,255,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 60% 30% at 70% 0%, rgba(255,255,255,0.25) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'spotlightPulse 3s ease-in-out infinite 0.5s',
        filter: 'blur(3px)'
      }} />
      <div style={{
        ...currentSize.title,
        fontFamily: '"Fredoka One", "Comfortaa", "Nunito", "Quicksand", "Rubik", "Baloo 2", sans-serif',
        letterSpacing: '3px',
        textAlign: 'center',
        color: '#ffffff',
        textTransform: 'uppercase',
        fontWeight: '400',
        fontStyle: 'normal',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        position: 'relative',
        zIndex: 1,
        textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2)'
      }}>
        {BRANDING.name}
      </div>

      {showSubtitle && (
        <div style={{
          ...currentSize.subtitle,
          opacity: 0.8,
          marginTop: '4px',
          letterSpacing: '1px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
          fontStyle: 'italic'
        }}>
          {BRANDING.subtitle}
        </div>
      )}
    </div>
  );
};

export default BrandingTitle;
