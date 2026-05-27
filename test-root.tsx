import { registerRoot, Composition, AbsoluteFill } from 'remotion';

const TestComponent = () => <AbsoluteFill style={{ background: 'white' }} />;

const RemotionRoot = () => (
  <Composition 
    id="TestComp" 
    component={TestComponent} 
    durationInFrames={30} 
    fps={30} 
    width={1920} 
    height={1080} 
  />
);

registerRoot(RemotionRoot);