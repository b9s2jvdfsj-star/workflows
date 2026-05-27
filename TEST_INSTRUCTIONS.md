# Full-Chain Integration Test Instructions

## Step 1: Launch the Stack
Run this command in the project root directory:
```bash
docker-compose up -d
```

This will start:
- Redis (for BullMQ queue)
- MinIO (S3-compatible storage)
- API service (on port 3000)
- Worker service (render.worker.ts)

## Step 2: Wait for Services to Ready
Wait approximately 30 seconds for all services to initialize. You can check logs with:
```bash
docker-compose logs -f
```

## Step 3: Trigger a Test Job
In a new terminal window, navigate to the project root and run:
```bash
# First install dependencies if needed
cd api
npm install
npm run build

# Then run the test script
npx ts-node test-render.ts
```

## Step 4: Verify Worker Processing
Monitor the worker logs to confirm job processing:
```bash
docker-compose logs -f worker
```

You should see logs indicating:
- Job received from queue
- Mock rendering started
- Asset uploaded to storage
- Job completed successfully

## Step 5: Verify MinIO Storage
To confirm the file exists in MinIO, you can:

### Option 1: Use MinIO Console
1. Open browser to http://localhost:9001
2. Login with:
   - Username: minioadmin
   - Password: minioadmin
3. Navigate to bucket: `global-video-engine`
4. Look for files in the `videos/` folder

### Option 2: Use MinIO Client (mc)
```bash
# Install mc if needed (https://min.io/docs/minio/linux/reference/minio-mc.html)
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc ls myminio/global-video-engine/videos/
```

### Option 3: Direct HTTP Access
Once you have the object name from the worker logs, you can access it via:
```
http://localhost:9000/global-video-engine/videos/{job-id}.mp4
```

## Expected Output from test-render.ts:
```
Testing video generation request...
Request successful!
Response: {
  message: 'Video generation process started',
  jobId: 'some-bullmq-job-id',
  prompt: 'Create a promotional video for a new eco-friendly product',
  region: 'EU',
  language: 'de'
}
```