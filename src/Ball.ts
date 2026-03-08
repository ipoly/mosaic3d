import type p5 from "p5";

export class Ball {
  private homeX: number;
  private homeY: number;
  private homeZ: number;
  x: number;
  y: number;
  z: number;
  r: number;
  c: p5.Color;

  constructor(p: p5, x: number, y: number, z: number, r: number, c: p5.Color) {
    this.homeX = this.x = x;
    this.homeY = this.y = y;
    this.homeZ = this.z = z;
    this.r = r;
    this.c = c;
  }

  display(p: p5) {
    p.push();
    p.translate(this.x, this.y, this.z);
    p.noStroke();
    p.fill(this.c);
    p.sphere(this.r, 10, 10);
    p.pop();
  }

  moveTo(p: p5, x: number, y: number, z?: number) {
    this.x = p.lerp(this.x, x, p.random(0.3));
    this.y = p.lerp(this.y, y, p.random(0.3));
    if (z !== undefined) {
      this.z = p.lerp(this.z, z, 0.1);
    }
  }

  colorTo(p: p5, c: p5.Color, rate = 0.1) {
    this.c = p.lerpColor(this.c, c, rate);
  }

  moveToTarget(p: p5, x: number, y: number, z: number, rate: number) {
    this.x = p.lerp(this.x, x, rate);
    this.y = p.lerp(this.y, y, rate);
    this.z = p.lerp(this.z, z, rate);
  }

  home(p: p5) {
    this.moveTo(p, this.homeX, this.homeY, this.homeZ);
  }
}
