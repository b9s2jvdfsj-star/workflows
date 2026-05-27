import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';
import { GlobalStandardHeader } from '../src/GlobalStandardHeader';

const UkComponent = () => {
  return <AbsoluteFill style={{ backgroundColor: 'white', paddingTop: '80px' }}>
    <GlobalStandardHeader region="UK" title="Market Analysis" />
    <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Hello Remotion!</h1>
  </AbsoluteFill>;
};

const UkRoot = () => (
  <Composition
    id="uk-composition"
    component={UkComponent}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(UkRoot);