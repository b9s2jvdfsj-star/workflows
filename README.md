# GP TECH LAB - Global Video Engine

## Overview

This repository implements a two-phase pipeline for generating market analysis videos for a global audience (USA, UK, Europe, Canada, Australia).

### Phase 1: Factory (Kaggle)
- **Location**: Kaggle notebook (kaggle_render.ipynb)
- **Purpose**: Generate high-fidelity AI asset clips (source videos, images, audio) using MuseTalk and LivePortrait.
- **Output**: Rendered asset clips should be downloaded from Kaggle and placed in the local /rendered-assets folder.
  - Optionally, organize by region: /rendered-assets/USA/, /rendered-assets/UK/, etc.

### Phase 2: Architect (Remotion)
- **Location**: Local Remotion project (/remotion)
- **Purpose**: Assemble the final video by combining assets with programmatic templates (intros, lower-thirds, brand transitions).
- **Trigger**: Run 
ode assemble.js <region> (e.g., 
ode assemble.js USA)
- **Process**:
  1. Reads assets from /rendered-assets (or /rendered-assets/<region> if region-specific folder exists).
  2. Passes assets as props to the appropriate Remotion template (usa.tsx, uk.tsx, etc.).
  3. Renders a 4K MP4 video to the /output folder.

## Directory Structure

`
/assets                 # Static assets (if any)
/rendered-assets        # Place Kaggle-generated assets here (manually transferred)
/rendered-assets/USA    # Optional: region-specific assets
/rendered-assets/UK     # Optional: region-specific assets
/remotion               # Remotion project (templates, compositions)
/output                 # Final rendered videos
/kaggle_render.ipynb    # Kaggle notebook for asset generation
/assemble.js            # Node script to trigger Remotion assembly
/.github/workflows/render.yml  # GitHub workflow to trigger Kaggle instructions

