const { renderMedia, selectComposition } = require('@remotion/renderer');
const { bundle } = require('@remotion/bundler');
const path = require('path');

// Parse command line arguments for --props
const args = process.argv.slice(2);
let inputProps = {}; // Default to empty object

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--props' && i + 1 < args.length) {
    try {
      inputProps = JSON.parse(args[i + 1]);
      console.log('📋 Using input props:', inputProps);
    } catch (e) {
      console.error('❌ Error parsing --props JSON:', e.message);
      process.exit(1);
    }
  }
}

(async () => {
  try {
    console.log('🎬 Starting render process...\n');

      // Step 1: Bundle the composition
      console.log('📦 Bundling project...');
      const bundleLocation = await bundle({
        entryPoint: path.resolve(__dirname, './remotion/templates/global-video/index.tsx'),
        publicDir: path.resolve(__dirname, './'),
      });
    console.log('✅ Bundle created at:', bundleLocation);
    console.log('');

    // Step 2: Select the composition
    console.log('🎯 Selecting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'GlobalVideo',
      inputProps: inputProps,
    });
    console.log('✅ Composition selected:', composition.id);
    console.log(`   Dimensions: ${composition.width}x${composition.height}`);
    console.log(`   Duration: ${composition.durationInFrames} frames @ ${composition.fps}fps`);
    console.log('');

    // Step 3: Render the composition
    console.log('🎥 Rendering video...');
    await renderMedia({
      composition: composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: path.resolve(__dirname, './out/global-video.mp4'),
      inputProps: inputProps,
      onProgress: ({ progress, renderedFrames }) => {
        process.stdout.write(`\r⏳ Progress: ${(progress * 100).toFixed(1)}% (${renderedFrames}/${composition.durationInFrames} frames)`);
      },
    });

    console.log('\n\n✅ Successfully rendered video to ./out/global-video.mp4');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error rendering video:');
    console.error('Message:', error.message);
    console.error('\nFull stack trace:');
    console.error(error.stack);
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n🔍 This is a MODULE_NOT_FOUND error.');
      console.error('Check if all dependencies are installed:');
      console.error('   npm install remotion @remotion/bundler @remotion/renderer');
    }
    
    process.exit(1);
  }
})();