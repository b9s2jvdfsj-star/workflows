import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';
import GlobalStandardHeader from '../src/GlobalStandardHeader';

// Define the props interface
interface Props {
  region?: string;
  title?: string;
  [key: string]: any; // Allow other props
}

const MyComponent = ({ region, title, ...rest }: Props) => {
  return <AbsoluteFill style={{ backgroundColor: 'white', paddingTop: '80px' }}>
    <GlobalStandardHeader 
      region={region || 'Global'} 
      title={title || 'Market Analysis'} 
    />
    <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Hello Remotion!</h1>
  </AbsoluteFill>;
};

const RemotionRoot = () => (
  <Composition
    id="my-composition"
    component={MyComponent}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(RemotionRoot);