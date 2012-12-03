class Mosaic {
  int ballSize = 5, cols, rows;
  float space, mWidth, mHeight,depth=200;
  PImage img;
  Ball[] balls = new Ball[40000];
  

  Mosaic() {
    init();
  }  

  Mosaic( int ballSize_) {
    ballSize = ballSize_;
    space = ballSize*2.3;
    init();
  }  

  Mosaic(int ballSize_, int space_) {
    ballSize = ballSize_;
    space = space_;
    init();
  }  

  void init() {
    for (int i=0;i<balls.length;i++) {
      balls[i] = new Ball(random(-width, width), random(-height, height), random(-depth, depth), ballSize, color(0,0));
    }
  }


  void animateTo(String imgPath) {
    img = loadImage(imgPath);
    rows = img.height;
    cols = img.width;
    mHeight = rows*space;
    mWidth = cols*space;
    
    pushMatrix();
    translate((width-mWidth)/2, (height-mHeight)/2,-depth);
    int count=0;
    for (int i=0;i<cols;i++) {
      for (int j=0;j<rows;j++) {
        color c = img.pixels[i+j*cols];
        if (alpha(c) != 0) {
          balls[count].moveTo(i*space, j*space, 0);
          balls[count].colorTo(c);
          balls[count].display();
          count++;
        }
      }
    }
    popMatrix();
  }
}

