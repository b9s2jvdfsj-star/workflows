import React from 'react';

// Global Standard Header Component
// Clean, minimalist design for consistent branding across regions (UK, USA, Australia)

type GlobalStandardHeaderProps = { 
  title?: string; 
  subtitle?: string; 
  region?: 'UK' | 'USA' | 'Australia' | 'Global';
  showDivider?: boolean;
};

const GlobalStandardHeader: React.FC<GlobalStandardHeaderProps> = ({ 
  title = 'Market Analysis', 
  subtitle, 
  region = 'Global', 
  showDivider = true 
}) => {
  // Region-specific color accents (subtle variations for local relevance)
  const regionColors: Record<string, string> = {
    UK: '#3C8DBC',      // Professional blue
    USA: '#002868',     // Patriot blue
    Australia: '#0083CA', // Australian blue
    Global: '#2C3E50'   // Dark slate (neutral/global)
  };

  const accentColor = regionColors[region] || regionColors.Global;

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: '#ffffff',
      borderBottom: showDivider ? `1px solid ${accentColor}33` : 'none',
      marginBottom: '30px'
    }}>
      <h1 style={{
        margin: 0,
        color: '#2C3E50',
        fontSize: '2.5rem',
        fontWeight: 600,
        letterSpacing: '-0.5px',
        lineHeight: 1.2
      }}>
        {title}
        {/* Subtle region indicator for global consistency */}
        {region !== 'Global' && (
          <span style={{
            display: 'inline-block',
            marginLeft: '12px',
            padding: '2px 8px',
            backgroundColor: accentColor,
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 500,
            verticalAlign: 'middle'
          }}>
            {region}
          </span>
        )}
      </h1>
      
      {subtitle && (
        <p style={{
          margin: '16px 0 0',
          color: '#5D6D7E',
          fontSize: '1.2rem',
          fontWeight: 400,
          lineHeight: 1.5,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {subtitle}
        </p>
      )}
      
      {showDivider && (
        <div style={{
          width: '60px',
          height: '3px',
          backgroundColor: accentColor,
          margin: '24px auto 0',
          borderRadius: '2px'
        }} />
      )}
    </div>
  );
};

export default GlobalStandardHeader;