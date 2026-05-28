const { renderMedia } = require('@remotion/renderer');
const path = require('path');

// Define props
const props = {
  region: 'AU',
  title: 'Economic Outlook'
};

// Render the video
renderMedia({
  composition: 'my-composition',
  serveUrl: 'http://localhost:3000',
  inputProps: props,
  outputLocation: path.resolve(__dirname, 'out/test-node-api.mp4'),
  codec: 'h264',
  imageFormat: 'jpeg',
  // Note: For h264/h265, use crf instead of quality
  crf: 18
}).then(() => {
  console.log('Render completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Render failed:', error);
  process.exit(1);
});