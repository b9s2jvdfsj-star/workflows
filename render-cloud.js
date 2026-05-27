const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments for --props
const args = process.argv.slice(2);
let propsFilePath = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--props') {
    if (i + 1 < args.length) {
      propsFilePath = path.resolve(args[i + 1]);
      i++; // skip the next argument
    } else {
      console.error('Missing value for --props');
      process.exit(1);
    }
  } else if (args[i].startsWith('--props=')) {
    const value = args[i].substring(8); // after '--props='
    propsFilePath = path.resolve(value);
  }
}

// Validate props file exists and is valid JSON
if (!propsFilePath) {
  console.error('No props file provided');
  process.exit(1);
}
if (!fs.existsSync(propsFilePath)) {
  console.error(`Props file not found: ${propsFilePath}`);
  process.exit(1);
}
try {
  JSON.parse(fs.readFileSync(propsFilePath, 'utf8'));
} catch (e) {
  console.error(`Invalid JSON in props file: ${propsFilePath}`);
  process.exit(1);
}

// Main render function
const renderVideo = async () => {
  try {
    console.log('🚀 Starting render process...');

    // Validate required assets
    const publicDir = path.resolve(__dirname, './public');
    const backgroundPath = path.join(publicDir, 'background.jpg');
    if (!fs.existsSync(backgroundPath)) {
      throw new Error(`Required asset not found: ${backgroundPath}`);
    }
    console.log('✅ Asset validation passed:');

    // Build the command
    const compositionPath = path.resolve(__dirname, './remotion/templates/global-video/index.tsx');
    const outputDir = path.resolve(__dirname, './out');
    const outputFilename = `global-video-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // The command string with forward slashes to avoid Windows escaping issues
    const compositionPathUnix = compositionPath.replace(/\\/g, '/');
    const outputPathUnix = outputPath.replace(/\\/g, '/');
    const propsFilePathUnix = propsFilePath.replace(/\\/g, '/');
    const command = `npx remotion render "${compositionPathUnix}" GlobalVideo "${outputPathUnix}" --props "${propsFilePathUnix}"`;
    console.log(`Executing: ${command}`);

    // Execute the command
    const { stdout, stderr } = await exec(command, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer

    // Convert to strings
    const stdoutString = stdout.toString();
    const stderrString = stderr.toString();

    if (stdoutString) {
      // Filter out Remotion's download progress if needed
      const lines = stdoutString.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        // Skip lines that are just download progress bars to reduce noise
        if (!line.includes('Downloading') && !line.includes('Mb/')) {
          console.log(line);
        }
      }
    }
    if (stderrString) {
      console.error(stderrString);
    }

    // Wait for the file to be written with polling
    const waitForFile = async (path, timeout = 10000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (fs.existsSync(path)) {
          // Small buffer to ensure file is no longer being written
          await new Promise(resolve => setTimeout(resolve, 500));
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return false;
    };

    const fileReady = await waitForFile(outputPath);
    if (!fileReady) {
      throw new Error('Video file was not created within the timeout period.');
    }

    const stats = fs.statSync(outputPath);
    console.log(`\n\n✅ Successfully rendered video to ${outputPath}`);
    console.log(`   File size: ${stats.size} bytes`);
    console.log(`   Modified: ${stats.mtime}`);

    return outputPath;
  } catch (error) {
    console.error('\n❌ Error rendering video:');
    console.error('Message:', error.message);
    console.error('\nFull stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
};

// If this script is run directly, execute the render
if (require.main === module) {
  renderVideo().then(outputPath => {
    process.exit(0);
  }).catch(error => {
    console.error('Failed to render video:', error);
    process.exit(1);
  });
}

module.exports = { renderVideo };