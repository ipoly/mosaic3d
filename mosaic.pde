class Mosaic {
  int ballSize = 5, cols, rows;
  float space, mWidth, mHeight, depth=(width+height)/2;
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
    float r = sqrt(width*width+height*height+depth*depth);
    for (int i=0;i<balls.length;i++) {
      balls[i] = new Ball(random(-r, r), 
      random(-r, r), 
      random(-r, r), 
      ballSize, color(255, 0));
    }
  }


  void animateTo(String imgPath) {
    img = loadImage(imgPath);
    rows = img.height;
    cols = img.width;
    mHeight = rows*space;
    mWidth = cols*space;

    pushMatrix();
    translate(-mWidth/2, -mHeight/2, 0);
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

    for (int i = count;count<balls.length;count++) {
      Ball b = balls[count];
      if (alpha(b.c) > 0) {
        b.home();
        b.colorTo(color(b.c, 0));
        b.display();
      }
    }
    popMatrix();
  }
}

