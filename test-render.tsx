import React from 'react';
import { registerRoot } from 'remotion';

const TestComponent = () => {
  return <div style={{ width: 1920, height: 1080, backgroundColor: 'white' }}>
    <h1>Test</h1>
  </div>;
};

const composition = {
  id: 'test',
  component: TestComponent,
  durationInFrames: 1,
  fps: 30,
  width: 1920,
  height: 1080,
};

registerRoot(composition);