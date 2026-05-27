import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';

// Outro composition
const Outro = () => {
  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(180deg, #24243e, #302b63, #0f0c29)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <div style={{ 
        textAlign: 'center', 
        color: 'white', 
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Thank You</h1>
        <p style={{ fontSize: '24px' }}>Follow for more insights</p>
      </div>
    </AbsoluteFill>
  );
};

const OutroRoot = () => (
  <Composition
    id="outro"
    component={Outro}
    durationInFrames={90} // 3 seconds at 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(OutroRoot);