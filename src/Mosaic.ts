import type p5 from "p5";
import { Ball } from "./Ball";

enum TransitionPhase {
  IDLE,
  EXPLODE,
  HOLD,
  IMPLODE,
}

export class Mosaic {
  private ballSize: number;
  private space: number;
  private balls: Ball[] = [];
  private readonly BALL_COUNT = 40000;
  private loadedImgs = new WeakSet<p5.Image>();

  // Transition state
  private phase = TransitionPhase.IDLE;
  private phaseStartFrame = 0;
  private visibleBallCount = 0;
  private targetBallCount = 0;
  private spherePositions: Float32Array = new Float32Array(this.BALL_COUNT * 3);
  private targetPositions: Float32Array = new Float32Array(this.BALL_COUNT * 3);
  private targetColors: Uint8Array = new Uint8Array(this.BALL_COUNT * 4);
  private targetImage: p5.Image | null = null;
  private currentImage: p5.Image | null = null;
  private targetScale = 1;

  // Timing constants (frames at 30fps)
  private readonly EXPLODE_DURATION = 30;
  private readonly HOLD_DURATION = 30;
  private readonly IMPLODE_DURATION = 30;
  private readonly LERP_RATE = 0.08;

  constructor(p: p5, ballSize = 5, space = 12) {
    this.ballSize = ballSize;
    this.space = space;
    this.init(p);
  }

  private init(p: p5) {
    const depth = (p.width + p.height) / 2;
    const r = Math.sqrt(p.width ** 2 + p.height ** 2 + depth ** 2);
    for (let i = 0; i < this.BALL_COUNT; i++) {
      this.balls[i] = new Ball(
        p,
        p.random(-r, r),
        p.random(-r, r),
        p.random(-r, r),
        this.ballSize,
        p.color(255, 0),
      );
    }
  }

  private calculateSpherePositions(count: number, radius: number) {
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < count; i++) {
      const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const idx = i * 3;
      this.spherePositions[idx] = Math.cos(theta) * radiusAtY * radius;
      this.spherePositions[idx + 1] = y * radius;
      this.spherePositions[idx + 2] = Math.sin(theta) * radiusAtY * radius;
    }
    // Shuffle sphere positions so balls are randomly distributed
    this.shuffleSpherePositions(count);
  }

  private shuffleSpherePositions(count: number) {
    // Fisher-Yates shuffle on position triplets
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const iIdx = i * 3;
      const jIdx = j * 3;
      // Swap x, y, z
      for (let k = 0; k < 3; k++) {
        const temp = this.spherePositions[iIdx + k];
        this.spherePositions[iIdx + k] = this.spherePositions[jIdx + k];
        this.spherePositions[jIdx + k] = temp;
      }
    }
  }

  private getSphereRadius(p: p5): number {
    return Math.min(p.width, p.height) * 0.35;
  }

  private getPhaseElapsed(p: p5): number {
    return p.frameCount - this.phaseStartFrame;
  }

  private getTargetColor(p: p5, index: number, alphaMultiplier = 1): p5.Color {
    const idx = index * 4;
    return p.color(
      this.targetColors[idx],
      this.targetColors[idx + 1],
      this.targetColors[idx + 2],
      this.targetColors[idx + 3] * alphaMultiplier,
    );
  }

  private fadeOutBall(p: p5, ball: Ball, rate?: number) {
    ball.home(p);
    const transparent = p.color(
      p.red(ball.c),
      p.green(ball.c),
      p.blue(ball.c),
      0,
    );
    ball.colorTo(p, transparent, rate);
    ball.display(p);
  }

  private fadeOutExcessBalls(p: p5, startIndex: number, rate?: number) {
    for (let i = startIndex; i < this.balls.length; i++) {
      const ball = this.balls[i];
      if (p.alpha(ball.c) > 0) {
        this.fadeOutBall(p, ball, rate);
      }
    }
  }

  private moveBallToSphere(
    p: p5,
    ball: Ball,
    index: number,
    posRate: number,
    colorRate: number,
    alphaMultiplier = 1,
  ) {
    const posIdx = index * 3;
    ball.moveToTarget(
      p,
      this.spherePositions[posIdx],
      this.spherePositions[posIdx + 1],
      this.spherePositions[posIdx + 2],
      posRate,
    );
    ball.colorTo(p, this.getTargetColor(p, index, alphaMultiplier), colorRate);
    ball.display(p);
  }

  private moveBallToTarget(
    p: p5,
    ball: Ball,
    index: number,
    posRate: number,
    colorRate: number,
  ) {
    const posIdx = index * 3;
    ball.moveToTarget(
      p,
      this.targetPositions[posIdx],
      this.targetPositions[posIdx + 1],
      this.targetPositions[posIdx + 2],
      posRate,
    );
    ball.colorTo(p, this.getTargetColor(p, index), colorRate);
    ball.display(p);
  }

  private loadImagePixels(img: p5.Image) {
    if (!this.loadedImgs.has(img)) {
      img.loadPixels();
      this.loadedImgs.add(img);
    }
  }

  private prepareTargetData(p: p5, img: p5.Image): number {
    if (!img.pixels || img.pixels.length === 0) return 0;

    const rows = img.height;
    const cols = img.width;
    const mHeight = rows * this.space;
    const mWidth = cols * this.space;

    const scaleX = (p.width * 0.8) / mWidth;
    const scaleY = (p.height * 0.8) / mHeight;
    this.targetScale = Math.min(scaleX, scaleY, 1);

    const offsetX = -mWidth / 2;
    const offsetY = -mHeight / 2;

    let count = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const pixelIdx = (i + j * cols) * 4;
        const a = img.pixels[pixelIdx + 3];

        if (a !== 0) {
          const posIdx = count * 3;
          const colorIdx = count * 4;
          // Pre-calculate world position (with scale applied)
          this.targetPositions[posIdx] =
            (i * this.space + offsetX) * this.targetScale;
          this.targetPositions[posIdx + 1] =
            (j * this.space + offsetY) * this.targetScale;
          this.targetPositions[posIdx + 2] = 0;
          // Store color
          this.targetColors[colorIdx] = img.pixels[pixelIdx];
          this.targetColors[colorIdx + 1] = img.pixels[pixelIdx + 1];
          this.targetColors[colorIdx + 2] = img.pixels[pixelIdx + 2];
          this.targetColors[colorIdx + 3] = a;
          count++;
        }
      }
    }
    return count;
  }

  startTransition(p: p5, newImage: p5.Image) {
    if (!newImage || newImage.width === 0) return;
    this.loadImagePixels(newImage);
    this.targetImage = newImage;
    this.targetBallCount = this.prepareTargetData(p, newImage);

    // If already in transition, jump to implode with new target
    if (this.phase !== TransitionPhase.IDLE) {
      this.phase = TransitionPhase.IMPLODE;
      this.phaseStartFrame = p.frameCount;
      return;
    }

    // Start new transition
    this.phase = TransitionPhase.EXPLODE;
    this.phaseStartFrame = p.frameCount;
    // Calculate sphere positions for the target ball count (excess balls fly away, new balls fade in)
    this.calculateSpherePositions(
      this.targetBallCount,
      this.getSphereRadius(p),
    );
  }

  animateTo(p: p5, img: p5.Image) {
    if (!img || img.width === 0) return;
    this.loadImagePixels(img);

    switch (this.phase) {
      case TransitionPhase.IDLE:
        this.renderIdle(p, img);
        break;
      case TransitionPhase.EXPLODE:
        this.renderExplode(p);
        break;
      case TransitionPhase.HOLD:
        this.renderHold(p);
        break;
      case TransitionPhase.IMPLODE:
        this.renderImplode(p);
        break;
    }
  }

  private renderIdle(p: p5, img: p5.Image) {
    if (!img.pixels || img.pixels.length === 0) return;
    const rows = img.height;
    const cols = img.width;
    const mHeight = rows * this.space;
    const mWidth = cols * this.space;

    const scaleX = (p.width * 0.8) / mWidth;
    const scaleY = (p.height * 0.8) / mHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    const offsetX = -mWidth / 2;
    const offsetY = -mHeight / 2;

    let count = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = (i + j * cols) * 4;
        const r = img.pixels[idx];
        const g = img.pixels[idx + 1];
        const b = img.pixels[idx + 2];
        const a = img.pixels[idx + 3];

        if (a !== 0) {
          const c = p.color(r, g, b, a);
          // Calculate world position (with scale applied)
          const worldX = (i * this.space + offsetX) * scale;
          const worldY = (j * this.space + offsetY) * scale;
          this.balls[count].moveTo(p, worldX, worldY, 0);
          this.balls[count].colorTo(p, c);
          this.balls[count].display(p);
          count++;
        }
      }
    }

    // Track visible ball count for transitions
    this.visibleBallCount = count;
    this.currentImage = img;

    this.fadeOutExcessBalls(p, count);
  }

  private renderExplode(p: p5) {
    const elapsed = this.getPhaseElapsed(p);
    const fadeInProgress = Math.min(
      elapsed / (this.EXPLODE_DURATION + this.HOLD_DURATION / 2),
      1,
    );
    const sphereBallCount = Math.min(
      this.visibleBallCount,
      this.targetBallCount,
    );

    // Reused balls: move to sphere
    for (let i = 0; i < sphereBallCount; i++) {
      this.moveBallToSphere(p, this.balls[i], i, this.LERP_RATE, 0.05);
    }

    // Excess balls from previous image: fly away
    for (let i = sphereBallCount; i < this.visibleBallCount; i++) {
      this.fadeOutBall(p, this.balls[i], 0.08);
    }

    // Fade in new balls at sphere positions
    for (let i = this.visibleBallCount; i < this.targetBallCount; i++) {
      this.moveBallToSphere(p, this.balls[i], i, 0.12, 0.15, fadeInProgress);
    }

    this.fadeOutExcessBalls(
      p,
      Math.max(this.visibleBallCount, this.targetBallCount),
    );

    if (elapsed >= this.EXPLODE_DURATION) {
      this.phase = TransitionPhase.HOLD;
      this.phaseStartFrame = p.frameCount;
    }
  }

  private renderHold(p: p5) {
    const elapsed = this.getPhaseElapsed(p);
    const fadeInElapsed = this.EXPLODE_DURATION + elapsed;
    const fadeInProgress = Math.min(
      fadeInElapsed / (this.EXPLODE_DURATION + this.HOLD_DURATION / 2),
      1,
    );
    const sphereBallCount = Math.min(
      this.visibleBallCount,
      this.targetBallCount,
    );

    // Reused balls: stay at sphere
    for (let i = 0; i < sphereBallCount; i++) {
      this.moveBallToSphere(p, this.balls[i], i, 0.02, 0.05);
    }

    // Excess balls: continue flying away
    for (let i = sphereBallCount; i < this.visibleBallCount; i++) {
      if (p.alpha(this.balls[i].c) > 0) {
        this.fadeOutBall(p, this.balls[i], 0.08);
      }
    }

    // Continue fading in new balls
    for (let i = this.visibleBallCount; i < this.targetBallCount; i++) {
      this.moveBallToSphere(p, this.balls[i], i, 0.05, 0.15, fadeInProgress);
    }

    this.fadeOutExcessBalls(
      p,
      Math.max(this.visibleBallCount, this.targetBallCount),
    );

    if (elapsed >= this.HOLD_DURATION) {
      this.phase = TransitionPhase.IMPLODE;
      this.phaseStartFrame = p.frameCount;
    }
  }

  private renderImplode(p: p5) {
    const elapsed = this.getPhaseElapsed(p);

    for (let i = 0; i < this.targetBallCount; i++) {
      this.moveBallToTarget(
        p,
        this.balls[i],
        i,
        this.LERP_RATE,
        this.LERP_RATE,
      );
    }

    this.fadeOutExcessBalls(p, this.targetBallCount);

    if (elapsed >= this.IMPLODE_DURATION) {
      this.phase = TransitionPhase.IDLE;
      this.visibleBallCount = this.targetBallCount;
      this.currentImage = this.targetImage;
    }
  }
}
