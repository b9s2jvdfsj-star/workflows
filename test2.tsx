import React from 'react';
import { Component, registerRoot } from 'remotion';

const MyComponent = () => {
  return <div style={{ width: 1920, height: 1080, backgroundColor: 'white' }}>
    <h1>Hello</h1>
  </div>;
};

const composition = {
  id: 'my-component',
  component: MyComponent,
  durationInFrames: 150,
  fps: 30,
  width: 1920,
  height: 1080,
};

registerRoot(composition);