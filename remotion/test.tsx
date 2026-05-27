import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';

const TestComp = () => {
  return <AbsoluteFill style={{ backgroundColor: 'white' }}>
    <h1>Test</h1>
  </AbsoluteFill>;
};

const TestRoot = () => (
  <Composition
    id="test-comp"
    component={TestComp}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(TestRoot);