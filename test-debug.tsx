import React from 'react';
import { AbsoluteFill, registerRoot } from 'remotion';

const TestDebug = () => {
  return <AbsoluteFill style={{ background: 'white' }} />;
};

const composition = {
  id: 'test-debug',
  component: TestDebug,
  durationInFrames: 150,
  fps: 30,
  width: 1920,
  height: 1080,
};

registerRoot(composition);