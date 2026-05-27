import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';

// USA-specific composition
const UsaComponent = () => {
  return <AbsoluteFill style={{ backgroundColor: 'white', paddingTop: '80px' }}>
    <div style={{ 
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #00286833',
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
        Market Analysis
        <span style={{
          display: 'inline-block',
          marginLeft: '12px',
          padding: '2px 8px',
          backgroundColor: '#002868',
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 500,
          verticalAlign: 'middle'
        }}>
          USA
        </span>
      </h1>
      
      <div style={{
        width: '60px',
        height: '3px',
        backgroundColor: '#002868',
        margin: '24px auto 0',
        borderRadius: '2px'
      }} />
    </div>
    <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Hello Remotion!</h1>
  </AbsoluteFill>;
};

const UsaRoot = () => (
  <Composition
    id="usa-composition"
    component={UsaComponent}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(UsaRoot);