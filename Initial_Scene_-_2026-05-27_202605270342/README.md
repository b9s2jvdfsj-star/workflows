# Initial Scene - 2026-05-27_202605270342

## Directory Structure
- raw-assets/: source video clips, audio, images per region
- rendering-scripts/: scripts to trigger Remotion renders (local or cloud)
- final-output/: rendered videos per region

Each region folder contains its own assets, scripts, and output.

## Performance Optimization
All heavy rendering tasks are intended to be offloaded to a scalable cloud instance (e.g., Google Cloud Run) to avoid local machine crashes.

## Quality Control
Configured for 9:16 vertical video, high bitrate H.264 (~12 Mbps VBR), AAC 48kHz 320kbps, cinematic hyper-realistic style.

## Next Steps
1. Place source assets in raw-assets/<region>/.
2. Add rendering scripts (e.g., render-cloud.js) in rendering-scripts/<region>/.
3. Execute scripts to produce final outputs in final-output/<region>/.


