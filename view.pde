class View {
  float thetaX, thetaY, speedX, speedY;
  int dBegin;


  View() {
  }

  void rotate() {
    //    rotateX(thetaX+=speedX);
    rotateY(thetaY+=speedY);
    speedX = lerp(speedX, 0, 0.005);
    speedY = lerp(speedY, 0, 0.005);
  }

  void dragging() {
    float thetaX_, thetaY_;
    int dEnd = frameCount;
    int time = dEnd - dBegin;
    dBegin = dEnd;

    if (time == 0) {
      return;
    }

    thetaX_ = -TWO_PI*(mouseY-pmouseY)/height;
    thetaY_ = TWO_PI*(mouseX-pmouseX)/width;

    speedX = thetaX_/time;
    speedY = thetaY_/time;

    thetaX += thetaX_;
    thetaY += thetaY_;
  }
}

