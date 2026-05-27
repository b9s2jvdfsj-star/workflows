// HandymanSequence.tsx
import { AbsoluteFill, Video, staticFile } from 'remotion';

export const HandymanSequence: React.FC = () => {
  return (
    <AbsoluteFill>
      <Video 
        // Use staticFile here. If the file is directly in /public, just use the filename.
        src={staticFile("Ultra‑realistic_15s_9_16_video_of_202605170741.mp4")}
        style={{ objectFit: 'cover' }} 
        muted={false} 
      />
    </AbsoluteFill>
  );
};