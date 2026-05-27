import { Worker } from 'bullmq';
import { renderQueue } from '../queues/render.queue';
import { StorageService } from '../services/storage.service';
import { VoiceService } from '../services/voice.service';
import { Logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Initialize services
const storageService = new StorageService();
const voiceService = new VoiceService();

// Helper to run the render-prod.js script with given environment variables
const runRenderScript = async (region: string, language: string, format: string, outputPath: string) => {
  const execAsync = promisify(exec);
  
  // Ensure output directory exists
  const outputDir = resolve(__dirname, '../../', outputPath).split(/[\\/]/).slice(0, -1).join('/');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Prepare inputProps to pass to the render script
  const inputProps = {
    region,
    language,
    format
  };
  
  const propsArg = `--props='${JSON.stringify(inputProps)}'`;
  
  const cwd = resolve(__dirname, '../../'); // Project root

  Logger.info(`Running render-prod.js with ${propsArg} and output path: ${outputPath}`);
  
  const { stdout, stderr } = await execAsync(`node render-prod.js ${propsArg}`, { cwd, maxBuffer: 1024 * 1024 });
  
  if (stdout) Logger.info(`render-prod.js stdout: ${stdout}`);
  if (stderr) Logger.warn(`render-prod.js stderr: ${stderr}`);
};

/**
 * Process a render-video job
 * @param job - The BullMQ job object
 */
const processRenderJob = async (job: any) => {
  try {
    const { prompt, region = 'US', language = 'en', format = 'landscape', ...otherData } = job.data;
    
    Logger.info(`Starting render job ${job.id} for prompt: "${prompt}" (Region: ${region}, Language: ${language}, Format: ${format})`);
    
    // Update job progress to 0%
    await job.updateProgress(0);
    
    // Step 1: Generate voice-over audio
    Logger.info('Generating voice-over audio...');
    const audioBuffer = await voiceService.generateAudio(prompt);
    
    // Optional: Normalize audio volume
    const normalizedAudioBuffer = await voiceService.normalizeAudio(audioBuffer);
    
    // Store audio in MinIO for Remotion to access
    Logger.info('Uploading audio to storage...');
    const audioKey = `audio/${job.id}.wav`;
    const audioUploadResult = await storageService.uploadAsset(normalizedAudioBuffer, audioKey);
    
    // Update job progress to 25% after audio processing
    await job.updateProgress(25);
    
    // Step 2: Render video using the actual Remotion script
    Logger.info('Rendering video with Remotion (actual)...');
    
    // Generate unique output path for this job
    const videoFilename = `${job.id}.mp4`;
    const videoOutputPath = `out/${videoFilename}`; // Relative to project root
    
    // Run the render script
    await runRenderScript(region, language, format, videoOutputPath);
    
    // Read the rendered video file
    const videoPath = resolve(__dirname, '../../', videoOutputPath);
    const videoBuffer = await promisify(require('fs').readFile)(videoPath);
    
    // Update job progress to 50% after rendering
    await job.updateProgress(50);
    
    // Step 3: Upload video asset to storage
    Logger.info('Uploading video asset to storage...');
    const videoKey = `videos/${videoFilename}`;
    const videoUploadResult = await storageService.uploadAsset(videoBuffer, videoKey);
    
    // Update job progress to 100% after upload
    await job.updateProgress(100);
    
    Logger.info(`Render job ${job.id} completed successfully.`);
    
    // Return the result
    return {
      videoUrl: videoUploadResult.location,
      audioUrl: audioUploadResult.location,
      jobId: job.id,
      prompt,
      region,
      language,
      format,
      ...otherData
    };
  } catch (error) {
    Logger.error(`Render job ${job.id} failed:`, error);
    throw error; // Re-throw to let BullMQ handle the job failure
  }
};

// Create the worker
const worker = new Worker(
  'video-engine', // Queue name
  processRenderJob, // Processor function
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379
    }
  }
);

// Handle worker events
worker.on('completed', (job) => {
  Logger.info(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  Logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('Received SIGTERM. Closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  Logger.info('Received SIGINT. Closing worker...');
  await worker.close();
  process.exit(0);
});

export default worker;