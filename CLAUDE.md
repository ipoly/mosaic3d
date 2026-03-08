# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A p5.js application that creates animated 3D mosaic visualizations from images. Particles (spheres) smoothly transition between different image configurations when clicking. Built with Vite + TypeScript, deployed to GitHub Pages.

## Development Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (http://localhost:5173/mosaic3d/)
pnpm build      # Build for production (output: dist/)
pnpm preview    # Preview production build
```

## Architecture

```
src/
├── main.ts      # Entry point: initializes p5 instance
├── sketch.ts    # Main sketch: preload, setup, draw, mouse handlers
├── Ball.ts      # Ball class: 3D sphere with position/color interpolation
├── Mosaic.ts    # Mosaic class: manages 40k balls, animates between images
└── View.ts      # View class: camera rotation via mouse drag with momentum

public/data/20/  # PNG images (0-13.png) for mosaic patterns
*.pde            # Original Processing files (legacy reference)
```

**Data Flow:**
1. `Mosaic` creates a pool of 40,000 `Ball` objects scattered randomly in 3D space
2. On each frame, `animateTo()` reads RGBA pixel data from current image
3. Non-transparent pixels become target positions; balls lerp toward them
4. Unused balls fade out and return to random "home" positions
5. `View` applies Y-axis rotation based on mouse drag with decay

## Controls

- **Left click**: Next image
- **Right click**: Previous image
- **Mouse drag**: Rotate view (with momentum)

## Key Technical Notes

- Uses p5.js **instance mode** - all p5 functions accessed via `p` parameter
- Pixel access: `img.loadPixels()` required before accessing `img.pixels` (RGBA array, 4 values per pixel)
- WEBGL mode: origin at canvas center, no manual centering needed
- GitHub Pages deployment via GitHub Actions (push to master triggers deploy)
