import { ReactNode } from 'react';
import { AbsoluteFill, Img, registerRoot, Composition, staticFile, useCurrentFrame, interpolate } from 'remotion';

// Define the props interface
interface GlobalVideoProps {
  region: string;
  language: string;
  format: 'landscape' | 'portrait' | 'square';
  durationInFrames: number;
}

// The Remotion component that renders the actual video content
const GlobalVideoContent = ({ region, language, format }: GlobalVideoProps) => {
  // Use a static asset for the background (local file, no network dependency)
  const backgroundUrl = staticFile('background.jpg');
  console.log('Static file URL:', backgroundUrl); // Debugging line

  // Placeholder for localized text
  const getLocalizedText = (language: string, key: string): string => {
    // In a real implementation, you would use a localization library or map
    // For now, we'll just return the key or a mock translation
    const mockTranslations: Record<string, Record<string, string>> = {
      en: { welcome: 'Welcome' },
      es: { welcome: 'Bienvenido' },
      fr: { welcome: 'Bienvenue' },
      de: { welcome: 'Willkommen' },
      ja: { welcome: 'ようこそ' },
    };
    return mockTranslations[language]?.[key] ?? key;
  };

  // Determine dimensions based on format
  const getDimensions = (format: string) => {
    switch (format) {
      case 'landscape':
        return { width: 1920, height: 1080 };
      case 'portrait':
        return { width: 1080, height: 1920 };
      case 'square':
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const { width, height } = getDimensions(format);

  // Get the current frame for animation
  const frame = useCurrentFrame();
  const fps = 30; // We know the composition uses 30 fps

  // CTA animation: starts at 5 seconds (150 frames), lasts 0.5 seconds (15 frames) for the slide-in
  const ctaStartFrame = 5 * fps; // 150
  const ctaEndFrame = ctaStartFrame + 0.5 * fps; // 165

  // Calculate opacity and translateY for the CTA
  const ctaOpacity = interpolate(frame, [ctaStartFrame, ctaEndFrame], [0, 1]);
  const ctaTranslateY = interpolate(frame, [ctaStartFrame, ctaEndFrame], [100, 0]); // Slide up from 100% to 0%

  // Load the logo static file (assuming it's in public/logo.png)
  const logoUrl = staticFile('logo.png');

  return (
    <AbsoluteFill>
      <Img
        src={backgroundUrl}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* CTA Component: slides in from bottom at 5 seconds */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%', // Resting position
          left: '0',
          right: '0',
          textAlign: 'center',
          transform: `translateY(${ctaTranslateY}%)`,
          opacity: ctaOpacity,
          pointerEvents: 'none', // So it doesn't interfere with any potential interactions
        }}
      >
        {/* Logo */}
        {logoUrl && <Img src={logoUrl} style={{ width: 80, height: 80, marginBottom: 10 }} />}
        {/* Text */}
        <div
          style={{
            fontSize: '24px',
            color: 'white',
            textShadow: '0 0 10px rgba(0,0,0,0.5)',
            fontFamily:
              language === 'ja'
                ? "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif"
                : "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          Follow The Method for more technical builds
        </div>
      </div>
      {/* Placeholder for localized text at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: 'white',
          fontSize: '24px',
          textShadow: '0 0 10px rgba(0,0,0,0.5)',
          // Font stack for better international text rendering
          fontFamily:
            language === 'ja'
              ? "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif"
                : "'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {getLocalizedText(language, 'welcome')} - {region}
      </div>
    </AbsoluteFill>
  );
};

// Create a composition that wraps our component and defines the metadata
const GlobalVideoComposition = ({ region, language, format, durationInFrames }: GlobalVideoProps) => {
  // Determine dimensions based on format
  const getDimensions = (format: string) => {
    switch (format) {
      case 'landscape':
        return { width: 1920, height: 1080 };
      case 'portrait':
        return { width: 1080, height: 1920 };
      case 'square':
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const { width, height } = getDimensions(format);

  return (
    <Composition
      id="GlobalVideo"
      component={GlobalVideoContent}
      durationInFrames={durationInFrames}
      fps={30}
      width={width}
      height={height}
    >
      <GlobalVideoContent region={region} language={language} format={format} />
    </Composition>
  );
};

// Register the composition component as the root component for Remotion
registerRoot(GlobalVideoComposition);

export default GlobalVideoComposition;