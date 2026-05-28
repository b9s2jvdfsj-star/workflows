const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get region and topic from command line arguments
const args = process.argv.slice(2);
let region = args[0] || 'Global';
let topic = args[1] || 'Market Analysis';
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
  topic,
  assets,
  // You can add other props like title, etc.
  title: ${topic} - 
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
const outputFile = path.join(outputDir, ${region.toLowerCase()}-output.mp4);

// Run remotion render
console.log(Rendering composition  for region ...);
console.log(Assets found: );
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

console.log(Render completed! Output saved to: );

// Generate metadata file
const metadata = generateMetadata(region, topic);
const metadataFile = path.join(outputDir, ${region.toLowerCase()}-output.metadata.json);
fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
console.log(Metadata saved to: );

// Clean up props file (optional)
// fs.unlinkSync(propsFile);

/**
 * Generate metadata for the video
 * @param {string} region - Target region (e.g., 'USA', 'UK')
 * @param {string} topic - Video topic (e.g., 'Market Analysis')
 * @returns {Object} Metadata object
 */
function generateMetadata(region, topic) {
  const now = new Date().toISOString();
  
  // Standardized title (could be more elaborate)
  const title = ${topic} -  Edition;
  
  // Keyword-optimized description with timestamp placeholders
  // In a real scenario, these timestamps would match the video chapters
  const description = [00:00] Introduction\\n[00:15]  Overview\\n[01:00] Key Market Trends\\n[02:30] Regional Focus: \\n[03:45] Actionable Insights\\n[04:30] Conclusion\\n\\nDisclaimer: For educational purposes only. Not financial advice.;
  
  // Relevant tags for global target regions
  const baseTags = [
    'finance',
    'market analysis',
    'investing',
    'global markets',
    region.toLowerCase(),
    topic.toLowerCase().replace(/\s+/g, '-')
  ];
  
  // Add region-specific tags
  const regionTags = {
    usa: ['USA', 'United States', 'NASDAQ', 'NYSE', 'Dow Jones'],
    uk: ['UK', 'United Kingdom', 'FTSE', 'London Stock Exchange'],
    australia: ['Australia', 'ASX', 'Australian Securities Exchange'],
    canada: ['Canada', 'TSX', 'Toronto Stock Exchange'],
    europe: ['Europe', 'EU', 'Euro Stoxx', 'European Markets']
  };
  
  const tags = [...baseTags, ...(regionTags[region.toLowerCase()] || [])];
  
  return {
    title,
    description,
    tags,
    region,
    topic,
    generatedAt: now
  };
}
