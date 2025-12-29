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
      title: { fontSize: '14px', fontWeight: '600' },
      subtitle: { fontSize: '10px', fontWeight: '400' }
    },
    medium: {
      title: { fontSize: '18px', fontWeight: '700' },
      subtitle: { fontSize: '12px', fontWeight: '400' }
    },
    large: {
      title: { fontSize: '24px', fontWeight: '800' },
      subtitle: { fontSize: '14px', fontWeight: '500' }
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`branding-title ${className}`} style={style}>
      <div style={{
        ...currentSize.title,
        letterSpacing: '0.5px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
