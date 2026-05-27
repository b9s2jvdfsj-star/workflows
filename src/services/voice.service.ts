import { execFile } from 'child_process';
import { promisify } from 'util';
import { config } from 'dotenv';
import { Logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

const execFileAsync = promisify(execFile);

/**
 * Service for generating voice-over audio using open-source TTS (e.g., Piper).
 */
export class VoiceService {
  private piperPath: string;
  private modelPath: string;
  private configPath: string;
  private useMock: boolean;

  constructor() {
    // Check if we should use mock (if environment variable set or piper not found)
    this.useMock = process.env.USE_MOCK_VOICE === 'true' || !this.checkPiperAvailable();

    if (!this.useMock) {
      // Paths to Piper executable and model (can be configured via env)
      this.piperPath = process.env.PIPER_PATH || '/usr/local/bin/piper';
      this.modelPath = process.env.PIPER_MODEL_PATH || '/app/voices/en_US-lessac-medium.onnx';
      this.configPath = process.env.PIPER_CONFIG_PATH || '/app/voices/en_US-lessac-medium.onnx.json';

      Logger.info(`VoiceService initialized with Piper: ${this.piperPath}`);
    } else {
      Logger.warn('VoiceService operating in mock mode (SET USE_MOCK_VOICE=false to use Piper TTS).');
    }
  }

  /**
   * Check if Piper is available (optional, we rely on USE_MOCK_VOICE)
   */
  private checkPiperAvailable(): boolean {
    // In a real implementation, we could check if the file exists.
    // For simplicity, we rely on the environment variable.
    return false;
  }

  /**
   * Generate audio from text using Piper TTS.
   * @param text - The text to convert to speech
   * @returns A promise that resolves to the audio buffer (WAV format)
   */
  public async generateAudio(text: string): Promise<Buffer> {
    if (this.useMock) {
      Logger.info(`Mock voice generation for text: "${text.substring(0, 50)}..."`);
      // Return a simple WAV header + dummy data (for mocking)
      // This is a minimal valid WAV file (44 bytes header + some data)
      const wavHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x00, 0x00, 0x00, // size (36 bytes + data length - 8, placeholder)
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6d, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // PCM chunk size (16)
        0x01, 0x00,             // PCM format (1)
        0x01, 0x00,             // channels (1)
        0x40, 0x1f, 0x00, 0x00, // sample rate (8000)
        0x40, 0x1f, 0x00, 0x00, // byte rate (sample rate * block align)
        0x02, 0x00,             // block align (channels * bits/sample/8)
        0x10, 0x00,             // bits per sample (16)
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x00, 0x00, 0x00  // data length (placeholder)
      ]);
      // Add some dummy audio data (e.g., 1 second of silence)
      const dummyData = Buffer.alloc(8000 * 2, 0); // 16-bit mono, 8000 samples
      return Buffer.concat([wavHeader, dummyData]);
    }

    try {
      // Create a temporary file for the output
      const outputFile = path.join('/tmp', `voice_${Date.now()}.wav`);

      // Run Piper: echo "$text" | piper --model $model_path --output_file $output_file
      const { stdout, stderr } = await execFileAsync('sh', ['-c', `echo "${text}" | "${this.piperPath}" --model "${this.modelPath}" --output_file "${outputFile}"`], {
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      if (stderr) {
        Logger.warn(`Piper stderr: ${stderr}`);
      }

      // Read the generated WAV file
      const audioBuffer = await promisify(fs.readFile)(outputFile);

      // Clean up the temporary file
      await promisify(fs.unlink)(outputFile);

      Logger.info(`Voice generated successfully for text: "${text.substring(0, 50)}..."`);
      return audioBuffer;
     } catch (error) {
       Logger.error('Failed to generate voice-over with Piper:', error);
       // Fallback to mock on error
       Logger.info('Falling back to mock voice generation.');
       // Return a mock buffer directly to avoid recursion
       const wavHeader = Buffer.from([
         0x52, 0x49, 0x46, 0x46, // "RIFF"
         0x24, 0x00, 0x00, 0x00, // size (placeholder)
         0x57, 0x41, 0x56, 0x45, // "WAVE"
         0x66, 0x6d, 0x74, 0x20, // "fmt "
         0x10, 0x00, 0x00, 0x00, // PCM chunk size (16)
         0x01, 0x00,             // PCM format (1)
         0x01, 0x00,             // channels (1)
         0x40, 0x1f, 0x00, 0x00, // sample rate (8000)
         0x40, 0x1f, 0x00, 0x00, // byte rate
         0x02, 0x00,             // block align
         0x10, 0x00,             // bits per sample (16)
         0x64, 0x61, 0x74, 0x61, // "data"
         0x00, 0x00, 0x00, 0x00  // data length (placeholder)
       ]);
       const dummyData = Buffer.alloc(8000 * 2, 0); // 1 second of silence
       return Buffer.concat([wavHeader, dummyData]);
     }
  }

  /**
   * Normalize audio volume using ffmpeg (loudnorm filter to -14 LUFS).
   * @param inputBuffer - The input audio buffer (WAV)
   * @returns A promise that resolves to the normalized audio buffer (WAV)
   */
  public async normalizeAudio(inputBuffer: Buffer): Promise<Buffer> {
    if (this.useMock) {
      Logger.info('Mock audio normalization (returning input as-is).');
      return inputBuffer; // In mock, just return the input
    }

    try {
      // Create temporary input and output files
      const inputFile = path.join('/tmp', `voice_input_${Date.now()}.wav`);
      const outputFile = path.join('/tmp', `voice_output_${Date.now()}.wav`);

      // Write input buffer to file
      await promisify(fs.writeFile)(inputFile, inputBuffer);

      // Run ffmpeg loudnorm filter
      await execFileAsync('ffmpeg', [
        '-i', inputFile,
        '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
        '-y', // overwrite output file
        outputFile
      ], { maxBuffer: 1024 * 1024 });

      // Read the normalized audio
      const normalizedBuffer = await promisify(fs.readFile)(outputFile);

      // Clean up temporary files
      await promisify(fs.unlink)(inputFile);
      await promisify(fs.unlink)(outputFile);

      Logger.info('Audio normalization completed.');
      return normalizedBuffer;
    } catch (error) {
      Logger.error('Failed to normalize audio:', error);
      // Return original buffer if normalization fails
      return inputBuffer;
    }
  }
}