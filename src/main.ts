import p5 from "p5";

p5.disableFriendlyErrors = true;
import { Mosaic } from "./Mosaic";
import { View } from "./View";

const len = 14;
let currentIndex = 0;
const thumbs: HTMLImageElement[] = [];

// Touch state
let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let isTouchDragging = false;
let lastTouchTime = 0;
const TAP_THRESHOLD = 200;
const MOVE_THRESHOLD = 10;

function updateActiveThumbnail() {
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle("active", i === currentIndex);
  });
}

function createThumbnails(baseUrl: string, setIndex: (i: number) => void) {
  const container = document.getElementById("thumbnails");
  if (!container) return;

  for (let i = 0; i < len; i++) {
    const img = document.createElement("img");
    img.src = `${baseUrl}data/20/${i}.png`;
    img.className = "thumb";
    img.addEventListener("click", () => {
      setIndex(i);
      updateActiveThumbnail();
    });
    container.appendChild(img);
    thumbs.push(img);
  }
  updateActiveThumbnail();
}

function getCanvasSize() {
  const container = document.getElementById("canvas-container");
  if (!container) return { width: 800, height: 600 };
  const thumbBar = document.getElementById("thumbnails");
  const thumbHeight = thumbBar ? thumbBar.offsetHeight : 64;
  return {
    width: window.innerWidth,
    height: window.innerHeight - thumbHeight,
  };
}

const sketch = (p: p5) => {
  let mosaic: Mosaic;
  let view: View;
  const imgs: p5.Image[] = [];
  let loaded = false;

  let lastSwitchTime = 0;
  const switchImage = (newIndex: number) => {
    const now = Date.now();
    // Debounce: ignore if called within 100ms
    if (now - lastSwitchTime < 100) return;
    if (newIndex === currentIndex) return;
    lastSwitchTime = now;
    currentIndex = newIndex;
    updateActiveThumbnail();
    if (loaded && imgs[currentIndex]) {
      mosaic.startTransition(p, imgs[currentIndex]);
    }
  };

  p.setup = async () => {
    const size = getCanvasSize();
    const canvas = p.createCanvas(size.width, size.height, p.WEBGL);
    canvas.parent("canvas-container");
    p.frameRate(30);
    mosaic = new Mosaic(p, 5, 12);
    view = new View();

    createThumbnails(import.meta.env.BASE_URL, (i) => {
      switchImage(i);
    });

    const promises = [];
    for (let i = 0; i < len; i++) {
      promises.push(p.loadImage(`${import.meta.env.BASE_URL}data/20/${i}.png`));
    }
    const loadedImgs = await Promise.all(promises);
    for (let i = 0; i < len; i++) {
      imgs[i] = loadedImgs[i];
    }
    loaded = true;

    setTimeout(() => {
      const hint = document.querySelector(".drag-hint");
      if (hint) hint.classList.add("hidden");
    }, 3000);
  };

  p.draw = () => {
    p.background(255);
    if (!loaded) return;
    p.lights();
    p.translate(0, 0, -200);
    view.rotate(p);
    if (imgs[currentIndex] && imgs[currentIndex].width > 0) {
      mosaic.animateTo(p, imgs[currentIndex]);
    }
  };

  p.mouseDragged = () => {
    view.dragging(p);
    const hint = document.querySelector(".drag-hint");
    if (hint) hint.classList.add("hidden");
  };

  p.mouseClicked = () => {
    // Ignore mouse click if it was triggered by touch (within 300ms)
    if (Date.now() - lastTouchTime < 300) return;
    switchImage((currentIndex + 1) % imgs.length);
  };

  p.windowResized = () => {
    const size = getCanvasSize();
    p.resizeCanvas(size.width, size.height);
  };
  (p as any).touchStarted = () => {
    touchStartTime = Date.now();
    touchStartX = p.mouseX;
    touchStartY = p.mouseY;
    isTouchDragging = false;
    return false;
  };
  (p as any).touchMoved = () => {
    const dx = p.mouseX - touchStartX;
    const dy = p.mouseY - touchStartY;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      isTouchDragging = true;
      view.dragging(p);
      const hint = document.querySelector(".drag-hint");
      if (hint) hint.classList.add("hidden");
    }
    return false;
  };
  (p as any).touchEnded = () => {
    lastTouchTime = Date.now();
    // Only handle tap if touch started and ended within canvas bounds
    const inCanvas =
      touchStartX >= 0 &&
      touchStartX <= p.width &&
      touchStartY >= 0 &&
      touchStartY <= p.height &&
      p.mouseX >= 0 &&
      p.mouseX <= p.width &&
      p.mouseY >= 0 &&
      p.mouseY <= p.height;
    if (!inCanvas) return false;
    const elapsed = lastTouchTime - touchStartTime;
    if (elapsed < TAP_THRESHOLD && !isTouchDragging) {
      switchImage((currentIndex + 1) % imgs.length);
    }
    return false;
  };
};

new p5(sketch);
