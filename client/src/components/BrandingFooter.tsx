import React from 'react';
import BRANDING from '../branding';

export const BrandingFooter: React.FC = () => {
  return (
    <footer style={{
      padding: '16px',
      textAlign: 'center',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,30,0.8))',
      marginTop: 'auto'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
      }}>
        {BRANDING.name}
      </div>

      <div style={{
        fontSize: '12px',
        opacity: 0.8,
        marginBottom: '12px',
        letterSpacing: '0.5px'
      }}>
        {BRANDING.subtitle}
      </div>

      <div style={{
        fontSize: '11px',
        opacity: 0.6,
        lineHeight: '1.4',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {BRANDING.description}
        <br />
        <span style={{ color: '#ffd700' }}>
          {BRANDING.tagline}
        </span>
      </div>

      <div style={{
        marginTop: '12px',
        fontSize: '10px',
        opacity: 0.5,
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {BRANDING.features.map((feature, index) => (
          <span key={index} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '4px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {feature}
          </span>
        ))}
      </div>
    </footer>
  );
};

export default BrandingFooter;
