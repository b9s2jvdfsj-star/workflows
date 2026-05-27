import { Queue } from 'bullmq';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Render queue for video processing jobs.
 * This queue is used to offload heavy rendering tasks to workers.
 */
export const renderQueue = new Queue('video-engine', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
  }
});

/**
 * Add a render-video job to the queue.
 * @param jobData - The data for the render job (prompt, etc.)
 * @returns A promise that resolves to the job ID
 */
export const addRenderJob = async (jobData: any) => {
  const job = await renderQueue.add('render-video', jobData, {
    // Optionally set job options like attempts, backoff, etc.
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
  return job.id;
};

export default renderQueue;