import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { renderQueue } from '../src/queues/render.queue';

// Load environment variables from .env file
dotenv.config({ path: '../.env' }); // .env is in the parent directory (project root)

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

/**
 * POST /generate-video
 * Accepts a prompt and adds a render job to the queue
 */
app.post('/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, region = 'US', language = 'en' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Add a render job to the queue with regional localization parameters
    const jobData = {
      prompt,
      region,
      language,
      timestamp: new Date().toISOString()
    };

    const job = await renderQueue.add('render-video', jobData, {
      // Optionally set job options like attempts, backoff, etc.
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    // Return success response
    res.status(202).json({
      message: 'Video generation process started',
      jobId: job.id,
      prompt,
      region,
      language
    });
  } catch (error) {
    console.error('Error in /generate-video:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /job/:jobId
 * Get the status of a specific job from BullMQ
 */
app.get('/job/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    // Get job from BullMQ
    const job = await renderQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Get job state
    const jobState = await job.getState();
    
    // Prepare response based on job state
    let responseData: any = {
      jobId: job.id,
      state: jobState,
      timestamp: new Date().toISOString()
    };
    
    // Add additional data based on state
    if (jobState === 'completed') {
      const returnvalue = job.returnvalue;
      responseData = {
        ...responseData,
        status: 'completed',
        videoUrl: returnvalue?.videoUrl,
        prompt: returnvalue?.prompt,
        region: returnvalue?.region,
        language: returnvalue?.language
      };
    } else if (jobState === 'failed') {
      const failedReason = job.failedReason;
      responseData = {
        ...responseData,
        status: 'failed',
        error: typeof failedReason === 'string' ? failedReason : JSON.stringify(failedReason)
      };
    } else {
      // For active, waiting, delayed states
      responseData = {
        ...responseData,
        status: jobState === 'active' ? 'processing' : jobState,
        progress: await job.getProgress()
      };
    }
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in /job/:jobId:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});

export default app;