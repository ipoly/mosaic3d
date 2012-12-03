Ball ball1;
PImage img;
Mosaic m;
int count =0;
int len = 14;
String[] imgs = new String[len];
String[] ani = new String[11];

void setup() {
  size(800, 600, P3D);
  background(0);
  frameRate(30);
  smooth();
  m = new Mosaic(5, 12);
  for(int i=0;i<len;i++){
    imgs[i] = "20/"+i+".png";
  }
  
  for(int i=0;i<11;i++){
    ani[i] = "ani/"+i+".gif";
  }
}

void draw() {
  background(255);
  lights();
  m.animateTo(imgs[count]);
//  m.animateTo(ani[count]);
  float camZ = (height/2.0)/tan(PI*60/360);
  camera(mouseX, mouseY, camZ, width/2.0, height/2.0, 0, 0, 1, 0);
}

void mousePressed(){
  count = ++count % imgs.length;
//  count = ++count % ani.length;
 }

