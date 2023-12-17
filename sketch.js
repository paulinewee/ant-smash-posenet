//ANT SMASHER
//Resizeable + Posenet

let score = 0;
let highScore = 0;
let lives = 3;
let gameStartTime, ant, blood, zigAnt, life;

let video;
let poseNet;
let poses = [];
let noseX = 0;
let noseY = 0;

let ants = [];

//basic settings
let gameSpeed = 1;
let gameNoise = 1;

let gameState = 0; //0 for startscreen, 1 for game, 2 for game over

function setup() {
  
  createCanvas(1000, 700);

  // load up your video
  video = createCapture(VIDEO);
  video.size(width, height);
  
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // Hide the video element, and just show the canvas
  video.hide();
  
  //cursor
  cursorSwat = loadImage('assets/swat.png');
  
  //music
  squish = loadSound('sound/splat.mp3');
  over = loadSound('sound/gameOver.mp3');
  soundtrack = loadSound('sound/urban.mp3');
  
  //backgrounds
  bg = loadImage('assets/wood.jpeg');
  startBg = loadImage('posestart.png');
  endBg = loadImage('poseend.png');
  candy = loadImage('assets/candy.png');
  
  //fonts
  titleFont = loadFont('p22.otf');
  
  //sprites
  zigAnt = loadImage('assets/zigant.png');
  ant = loadImage('assets/ant1.png');
  blood = loadImage('assets/blood8.png');
  life = loadImage('assets/redheart.png');
  dead = loadImage('assets/blackheart.png')
  
  //settings
  gear = loadImage('assets/gear.png');
}

// ML POSENET STUFF

function modelReady() {
  poseNet.on('pose', gotPose);
  // This sets up an event that fills the global variable "poses"
}

function gotPose(results) {
  poses = results;
  
  // with an array every time new poses are detected
  if (! poses || poses.length < 1) return;
  //leave this function if the results don't look right
  //console.log(poses[0].pose.nose.x);
  noseX = poses[0].pose.nose.x;
  noseY = poses[0].pose.nose.y;
}
//creates an ant object
class Ant {
  constructor(img, size, speed, n) {
    this.x = random(100, width)-100; //x position
    this.y = 0; //y position
    this.size = size; 
    this.speed = speed;
    this.img = img;
    this.n = n; //noise
    this.dead = false;
    this.timeDied = 100000;
  }
  
  display() {
    image(this.img, this.x, this.y, this.size, this.size)
  }
  
  move() {
    //if thing pressed
    if (noseX>this.x && noseX<this.x+this.size && noseY>this.y &&noseY<this.y+this.size) {
      
      this.speed = 0; //stop moving
      image(blood, this.x, this.y, this.size, this.size) //blood splat
      this.dead=true; //mark dead
      squish.play(); // audio
      score++
      
    } else {
      
      let randList = [-this.n, this.n];
      this.x+=random(randList);
      this.y += this.speed + random(randList);
    }
  }
  
}

function draw() {
  
  if (gameState==0) startScreen(); 
  else if (gameState==1) game();
  else if (gameState==2) gameOver();
  else if (gameState==3) settings();
}

//HELPER FUNCTIONS

//restarts games and resets ant list, score time, lives 
function restartGame() {
  now = millis();
  gameStartTime = now;
  score = 0;
  ants=[];
  lives = 3;
}

// returns time in millis since game started
function millisInGame() {
  // Subtract when the game started from current time
  return millis() - gameStartTime;
}

//show remaining lives and decrease candy stack
function displayLives() {
  
  //this is a bit messy but it works; will implement a more efficient method eventually
  
  //variables for heart
  let leftMargin = width/2-100;
  let topMargin = 20;
  let lifeXPos = 40;
  let size = 40;
  
  if (lives==3) { //3 red hearts
    image(life, leftMargin + lifeXPos, topMargin, size, size);
    image(life, leftMargin + lifeXPos*2, topMargin, size, size);
    image(life, leftMargin + lifeXPos*3, topMargin, size, size);
    //original candy stack
    image(candy, 0, height-100, width, 200);
  } else if (lives==2) { //2 red, 1 black heart
    image(life, leftMargin + lifeXPos, topMargin, size, size);
    image(life, leftMargin + lifeXPos*2, topMargin, size, size);
    image(dead, leftMargin + lifeXPos*3, topMargin, size, size);
    //decrease candy stack
    image(candy, 0, height-80, width, 200);
    
  } else if (lives==1) { //1 red, 2 black hearts
    image(life, leftMargin + lifeXPos, topMargin, size, size);
    image(dead, leftMargin + lifeXPos*2, topMargin, size, size);
    image(dead, leftMargin + lifeXPos*3, topMargin, size, size);
    //decrease candy stack
    image(candy, 0, height-60, width, 200);
  } else { //3 black hearts
    image(dead, leftMargin + lifeXPos, topMargin, size, size);
    image(dead, leftMargin + lifeXPos*2, topMargin, size, size);
    image(dead, leftMargin + lifeXPos*3, topMargin, size, size);
  }
}

//all buttons use this
function button(string, color, x, y, w, h) {
  
  //if button clicked, do sth
  if (mouseX>x && mouseX<x+w && mouseY>y &&mouseY<y+h) {
    
    color = "#F6D047"; //hover color
    
    //when pressed
    if (mouseIsPressed) {
      if (string=="start") { //start
        restartGame();
        gameState = 1;
      } else if (string == "play again") { //replay
        gameState = 0;
      } else if (string == "easy") { //game modes
        gameSpeed = 1;
        gameNoise = 1;
        gameState = 0;
      } else if (string == "medium") {
        gameSpeed = 2.5;
        gameNoise = 1.5;
        gameState = 0;
      } else if (string == "hard") {
        gameSpeed = 4;
        gameNoise = 2;
        gameState = 0;
      } 
    }
  }
  
  //button rect
  fill(color);
  stroke(1.5);
  rect(x, y, w, h, 40) //40 is border rounding
  
  //button text
  fill(0);
  textFont(titleFont);
  noStroke();
  textSize(20);
  text(string, width/2-textWidth(string), y+h/2+5,textWidth(string)*2);
  //end of button
  
}

//title text
function titleText(title, size, h) {
  textAlign(CENTER);
  textFont(titleFont);
  textLeading(56);
  textSize(size);
  text(title, (width-textWidth(title))/2, height/2-h, textWidth(title))
}

//body text
function bodyText(body, size, h) {
  textAlign(CENTER);
  textFont(titleFont);
  textSize(size);
  text(body, (width-textWidth(body))/2-20, height/2-h, textWidth(body)+40)
}

//GAME STATES

//start screen
function startScreen() {
  background(startBg);

  titleText("Posenet Ant Smasher", 60, 80)
  
  //settings in upper right corner
  image(gear, width-40 , 20, 20, 20)
  if (mouseX>width-40 && mouseX<width-20 && mouseY>20 &&mouseY<40 && mouseIsPressed) {
    gameState = 3; //go to settings
  }
  
  //start button
  button("start", "#FFEB5A", width/2-100, height/2+10, 200, 60);
  
  //cursor swatter
  image(cursorSwat, mouseX-10, mouseY-10, 50, 50);

}

//actual game
function game() {
  
  if (!soundtrack.isPlaying()) soundtrack.play(); //play music if not playing already
  
  push();
  
  translate(video.width, 0);
  //then scale it by -1 in the x-axis
  //to flip the image
  scale(-1, 1);
  
  image(video, 0, 0, width, height);
  
  fill(255,0,0);
  noStroke();
  
  ellipse(noseX, noseY, 40, 40);
  image(cursorSwat, noseX, noseY, 70, 70);
  
  
  if (frameCount % 140==0) { //new ant 
    ants.push(new Ant(ant, 70, gameSpeed, noise(gameNoise)));
  }
  
  if (frameCount % 200==0) { //new big ant 
    ants.push(new Ant(zigAnt, 80, gameSpeed+1, noise(gameNoise+2)));
  }
  pop();
  
  push();
  
  //score
  fill(0);
  textSize(25);
  textAlign(LEFT);
  text("Score: " + score, 20, 40, 120); //score
  
  //remaining lives
  displayLives();
  
  //timer
  textAlign(RIGHT);
  let timer = round(millisInGame()/1000);
  text(timer, width-textWidth(timer)-70, 40, 60);
  
  pop();
  push();
  translate(video.width, 0);
  scale(-1, 1);
  
  //display ants
  for (let i=ants.length-1; i>0; i--) {
    
    //move and display as normal
    ants[i].move();
    ants[i].display();
    
    //splice and subtract life if out of bounds
    if (ants[i].y>=height) {
      lives--;
      ants.splice(i, 1);
    }
    
    //splice if dead
    if (ants[i].dead==true) {
      ants.splice(i, 1);
    }
    
  } 
  
  //if no more lives, game over
  //game over sound and stop soundtrack
  if (lives<=0) {
    gameState=2;
    over.play();
    soundtrack.stop();
  }
  pop();
  
}

//settings page
function settings() {
  background(startBg);
  
  titleText("Settings", 48, 160);
  
  //difficulty settings
  bodyText("Difficulty", 20, 105);
  button("easy", "#FFEB5A", width/2-100, height/2-80, 200, 60);
  button("medium", "#FFEB5A", width/2-100, height/2, 200, 60);
  button("hard", "#FFEB5A", width/2-100, height/2+80, 200, 60);
  
  //cursor swatter
  image(cursorSwat, mouseX-10, mouseY-10, 50, 50);
}

//game over
function gameOver() {
  
  background(endBg);
  
  titleText("Game Over", 60, 130);
  
  //score
  scoreText = "Your score: " + score;
  bodyText(scoreText, 25, 10)
  
  //highscore display and comparison
  if (score>highScore) highScore = score;
  let highScoreText = "High score: " + highScore;
  bodyText(highScoreText, 25, -20)
  
  //play again
  button("play again", "#edb424", width/2-100, height/2+60, 200, 60);
  
  //cursor swatter
  image(cursorSwat, mouseX-10, mouseY-10, 50, 50);
  
}


