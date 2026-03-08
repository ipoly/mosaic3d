import type p5 from "p5";

export class View {
  private thetaY = 0;
  private speedY = 0;
  private dragBegin = 0;

  rotate(p: p5) {
    this.thetaY += this.speedY;
    this.speedY = p.lerp(this.speedY, 0, 0.005);
    p.rotateY(this.thetaY);
  }

  dragging(p: p5) {
    const dragEnd = p.frameCount;
    const time = dragEnd - this.dragBegin;
    this.dragBegin = dragEnd;

    if (time === 0) return;

    const thetaY_ = (p.TWO_PI * (p.mouseX - p.pmouseX)) / p.width;

    this.speedY = thetaY_ / time;
    this.thetaY += thetaY_;
  }
}
