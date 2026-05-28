const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get region from command line argument or default to 'Global'
const args = process.argv.slice(2);
let region = args[0] || 'Global';
// Normalize region to match our templates
region = region.trim();

// Define the asset directory
const assetDir = path.resolve(__dirname, 'rendered-assets');
// If region-specific assets exist, use them; otherwise use root
let assets = [];
const regionAssetDir = path.join(assetDir, region);
if (fs.existsSync(regionAssetDir)) {
  // Read all files in the region asset directory
  const files = fs.readdirSync(regionAssetDir);
  assets = files.map(file => ({
    src: path.join(regionAssetDir, file),
    // We can also derive a name or type from the filename
    name: path.parse(file).name,
    type: path.parse(file).ext.slice(1) // remove the dot
  }));
} else if (fs.existsSync(assetDir)) {
  // Use general assets
  const files = fs.readdirSync(assetDir);
  assets = files.map(file => ({
    src: path.join(assetDir, file),
    name: path.parse(file).name,
    type: path.parse(file).ext.slice(1)
  }));
}

// Prepare props object
const props = {
  region,
  assets,
  // You can add other props like title, etc.
  title: `Market Analysis - ${region}`
};

// Write props to a temporary file
const tmpDir = path.resolve(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}
const propsFile = path.join(tmpDir, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));

// Determine composition ID based on region
let compositionId = 'my-composition'; // default from index.tsx
if (region.toLowerCase() === 'usa') {
  compositionId = 'usa-composition';
} else if (region.toLowerCase() === 'uk') {
  compositionId = 'uk-composition';
}
// Add more regions as needed

// Output directory
const outputDir = path.resolve(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
const outputFile = path.join(outputDir, `${region.toLowerCase()}-output.mp4`);

// Run remotion render
console.log(`Rendering composition ${compositionId} for region ${region}...`);
console.log(`Assets found: ${assets.length}`);
const result = spawnSync('npx', [
  'remotion',
  'render',
  compositionId,
  outputFile,
  '--props',
  propsFile
], { stdio: 'inherit' });

if (result.error) {
  console.error('Failed to render:', result.error);
  process.exit(1);
}

console.log(`Render completed! Output saved to: ${outputFile}`);

// Clean up props file (optional)
// fs.unlinkSync(propsFile);
