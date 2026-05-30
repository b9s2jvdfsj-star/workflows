const { renderMedia } = require('@remotion/renderer');
const path = require('path');

// Define props
const props = {
  region: 'AU',
  title: 'Economic Outlook'
};

// 🔍 READ ENV VARS FOR DYNAMIC CONFIG (Colab/Kaggle compatible)
const ffmpegOptions = {
  crf: parseInt(process.env.FFMPEG_CRF) || 18,           // Default 18, override via env
  preset: process.env.FFMPEG_PRESET || 'ultrafast',      // Default ultrafast, override via env
};

// Render the video
renderMedia({
  composition: 'my-composition',
  serveUrl: 'http://localhost:3000',
  inputProps: props,
  outputLocation: path.resolve(__dirname, 'out/test-node-api.mp4'),
  codec: 'h264',
  imageFormat: 'jpeg',
  ffmpegOptions: ffmpegOptions,
}).then(() => {
  console.log('Render completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Render failed:', error);
  process.exit(1);
});