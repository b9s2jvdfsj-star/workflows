import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from 'dotenv';
import { Logger } from '../utils/logger';

// Load environment variables
config();

/**
 * Service for handling asset storage operations.
 * Currently configured for AWS S3, but designed to be swappable.
 */
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.bucketName = process.env.AWS_S3_BUCKET || 'global-video-engine-assets';

    if (!accessKeyId || !secretAccessKey) {
      Logger.warn('AWS credentials not found. StorageService will operate in mock mode.');
      this.s3Client = null as any;
      return;
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload an asset to storage.
   * @param fileBuffer - The file buffer to upload
   * @param key - The storage key (path) for the file
   * @returns A promise that resolves to the upload result
   */
  public async uploadAsset(fileBuffer: Buffer, key: string): Promise<any> {
    // If we don't have S3 configured, return a mock result
    if (!this.s3Client) {
      Logger.info(`Mock upload: ${key} (${fileBuffer.length} bytes)`);
      return {
        location: `https://mock-storage.example.com/${this.bucketName}/${key}`,
        key,
        ETag: `"mock-etag-${Date.now()}"`,
      };
    }

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: 'video/mp4', // Adjust based on actual file type if needed
        },
      });

      const result = await upload.done();
      Logger.info(`Asset uploaded successfully: ${key}`);
      return result;
    } catch (error) {
      Logger.error(`Failed to upload asset ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a signed URL for an asset (for temporary access).
   * @param key - The storage key (path) for the file
   * @param expiresIn - Seconds until the URL expires (default: 3600)
   * @returns A promise that resolves to the signed URL string
   */
  public async getAssetUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client) {
      // Return a mock URL
      return `https://mock-storage.example.com/${this.bucketName}/${key}?token=mock-token`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      Logger.error(`Failed to get signed URL for asset ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete an asset from storage.
   * @param key - The storage key (path) for the file
   * @returns A promise that resolves when the asset is deleted
   */
  public async deleteAsset(key: string): Promise<void> {
    if (!this.s3Client) {
      Logger.info(`Mock delete: ${key}`);
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      Logger.info(`Asset deleted successfully: ${key}`);
    } catch (error) {
      Logger.error(`Failed to delete asset ${key}:`, error);
      throw error;
    }
  }
}