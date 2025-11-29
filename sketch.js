let vol = 0;
let smoothVol = 0;

let particles = [];

// NASA Thermal Palette
let c1, c2, c3, c4;

let audioContext;
let analyser;
let dataArray;

// ------------------------------------------------------
// SETUP
// ------------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#000000');

  textAlign(CENTER, CENTER);
  textSize(28);
  fill(120);
  text("화면을 터치해서 시작하세요 🎤", width / 2, height / 2);

  // NASA thermal palette
  c1 = color('#1B0050');
  c2 = color('#7A1C8A');
  c3 = color('#FF6B1A');
  c4 = color('#FFFFFF');
}

// ------------------------------------------------------
// 🔥 탭 오디오 캡처 시작
// ------------------------------------------------------
async function mousePressed() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: false
    });

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);

    console.log("🎉 탭 오디오 연결 완료!");

  } catch (err) {
    console.error("오디오 캡처 실패:", err);
  }
}

// ------------------------------------------------------
// DRAW
// ------------------------------------------------------
function draw() {
  background('#000000');

  if (analyser) {
    analyser.getByteTimeDomainData(dataArray);

    // 0~255 → 0~1
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    vol = sum / dataArray.length / 128;
    smoothVol = lerp(smoothVol, vol, 0.15);

    let energy = smoothVol * 1000;

    if (energy > 5) {
      createParticles(int(energy * 0.5));
    }

    // update + display
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].display();
      if (particles[i].isDead()) particles.splice(i, 1);
    }
  }
}

// -------------------------------------------------
// 🌋 PARTICLE SYSTEM (지원님 코드 그대로 유지)
// -------------------------------------------------
function createParticles(count) {
  count = constrain(count, 3, 10);

  for (let i = 0; i < count; i++) {
    let px = width / 2;
    let py = height / 2;

    let main = new Particle(px, py);
    particles.push(main);

    createShards(px, py, main.size);
  }
}

function createShards(x, y, parentSize) {
  let shardCount = int(random(8, 14));

  for (let i = 0; i < shardCount; i++) {
    particles.push(new ShardParticle(x, y, parentSize));
  }

  for (let i = 0; i < 12; i++) {
    particles.push(new MiniParticle(x, y, parentSize));
  }
}

// -------------------------------------------------
function thermalColor(t) {
  if (t < 0.33) {
    return lerpColor(c1, c2, t / 0.33);
  } else if (t < 0.66) {
    return lerpColor(c2, c3, (t - 0.33) / 0.33);
  } else {
    return lerpColor(c3, c4, (t - 0.66) / 0.34);
  }
}

// -------------------------------------------------
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 4));

    let baseSize = random(40, 90);
    let volBoost = smoothVol * 800;
    this.size = baseSize + volBoost;

    this.alpha = 255;

    let t = constrain(smoothVol * 15, 0, 1);
    this.col = thermalColor(t);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.9);
    this.alpha -= 12;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

// -------------------------------------------------
class ShardParticle {
  constructor(x, y, parentSize) {
    this.pos = createVector(
      x + random(-parentSize * 0.2, parentSize * 0.2),
      y + random(-parentSize * 0.2, parentSize * 0.2)
    );

    this.vel = p5.Vector.random2D().mult(random(2, 6));
    this.size = random(4, 12);
    this.alpha = 200;

    let t = constrain(smoothVol * 15, 0, 1);
    this.col = thermalColor(t);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.88);
    this.alpha -= 18;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

// -------------------------------------------------
class MiniParticle {
  constructor(x, y, parentSize) {
    this.pos = createVector(
      x + random(-parentSize * 0.3, parentSize * 0.3),
      y + random(-parentSize * 0.3, parentSize * 0.3)
    );

    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.size = random(1, 3);
    this.alpha = 180;

    let t = constrain(smoothVol * 15, 0, 1);
    this.col = thermalColor(t);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.92);
    this.alpha -= 15;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

// -------------------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#000000');
}
