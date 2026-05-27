import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';

// Intro composition
const Intro = () => {
  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(180deg, #0f0c29, #302b63, #24243e)', 
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
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Global Market Analysis</h1>
        <p style={{ fontSize: '24px' }}>Insights for USA, UK, Australia, Canada & Global</p>
      </div>
    </AbsoluteFill>
  );
};

const IntroRoot = () => (
  <Composition
    id="intro"
    component={Intro}
    durationInFrames={90} // 3 seconds at 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(IntroRoot);