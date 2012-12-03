
class Ball {
  float homex, x, homey, y, homez, z;
  int r;
  color c;
  boolean isMoving=false;

  //3d
  Ball(float x_, float y_, float z_, int r_, color c_) {
    homex=x=x_;
    homey=y=y_;
    homez=z=z_;
    r=r_;
    c=c_;
  } 

  //2d
  Ball(float x_, float y_, int r_, color c_) {
    homex=x=x_;
    homey=y=y_;
    r=r_;
    c=c_;
  }

  void display() {
    pushMatrix();
    translate(x, y, z);
    noStroke();
    fill(c);
    sphereDetail(10);
    sphere(r);
    popMatrix();
  }


  //2d
  void moveTo(float x_, float y_) {
    x = lerp(x, x_, random(0.3));
    y = lerp(y, y_, random(0.3));
  }

  //3d
  void moveTo(float x_, float y_, float z_) {
    moveTo(x_,y_);
    z = lerp(z, z_, 0.1);
  }
  
  void colorTo(color c_){
    c = lerpColor(c,c_,0.1);
  }
  
  void home() {
    moveTo(homex, homey, homez);
  }
}

