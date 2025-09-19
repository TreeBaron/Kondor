import {
  createAsteroid,
  inXSeconds,
  pixelPerfectCheck,
  getRandomPlanetName,
} from "./Helper.ts";
import { Level } from "./LevelClass.ts";
import { TextDisplay } from "./TextDisplay.ts";

const worldHeight = 1000 * 12;
const worldWidth = 1000 * 12;
const starsToAdd = 100;
const gravityDistance = 1500;
const gravityStrength = 4;

let player;
let staticStars: Phaser.GameObjects.Image[] = [];
let needsUpdateCall: any[] = [];
let messages: TextDisplay[] = [];

let keyW;
let keyA;
let keyS;
let keyD;
let keySpace;

function getConfig(): Partial<Phaser.Types.Core.GameConfig> {
  return {
    type: Phaser.AUTO,
    parent: "phaser-game-container",
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    min: {
      width: 920,
      height: 720,
    },
    max: {
      width: 920,
      height: 720,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
      },
    },
    roundPixels: false,
    pixelArt: false,
    antialias: false,
  };
}

// load assets like images and sounds
function preload() {
  console.log("preload() started.");

  this.load.image("star", "assets/bluestar.png");

  this.load.image("player", "assets/player.png");
  this.load.image("playerflame", "assets/playerflame.png");
  this.load.image("playerbullet", "assets/playerbullet.png");

  this.load.image("ammotown", "assets/ammotown.png");
  this.load.image("asteroid1", "assets/asteroid1.png");
  this.load.image("asteroid2", "assets/asteroid2.png");
  this.load.image("asteroid3", "assets/asteroid3.png");
  this.load.image("cargoammo", "assets/cargoammo.png");
  this.load.image("cargofuel", "assets/cargopeople.png");
  this.load.image("earthplanet", "assets/earthplanet.png");
  this.load.image("enemy", "assets/enemy.png");
  this.load.image("enemybullet", "assets/enemybullet.png");
  this.load.image("enemyflame", "assets/enemyflame.png");
  this.load.image("gasplanet", "assets/gasplanet.png");
  this.load.image("gastown", "assets/gastown.png");
  this.load.image("land1platform", "assets/land1platform.png");
  this.load.image("land2platform", "assets/land2platform.png");
  this.load.image("land3platform", "assets/land3platform.png");
  this.load.image("landingpad", "assets/landingpad.png");
  this.load.image("peopletown", "assets/peopletown.png");
  this.load.image("rawland1", "assets/rawland1.png");
  this.load.image("rawland2", "assets/rawland2.png");
  this.load.image("rawland3", "assets/rawland3.png");
  this.load.image("ringplanet", "assets/ringplanet.png");

  // Friends lol
  this.load.image("andrew", "assets/andrew.png");
  this.load.image("walter", "assets/walter.png");
  this.load.image("marshall", "assets/marshall.png");
  this.load.image("jd", "assets/jd.png");
  this.load.image("john", "assets/john.png");
  this.load.image("nancie", "assets/nancie.png");
  this.load.image("joebiden", "assets/joebiden.png");
}

// create is called once, after preload
function create() {
  console.log("create() started.");

  this.graphics = this.add.graphics();

  // COLLISION DETECTION CANVAS
  this.collisionCanvas = document.createElement("canvas");
  this.collisionCanvas.width = 256;
  this.collisionCanvas.height = 256;
  this.ctx = this.collisionCanvas.getContext("2d");

  /*
  // DEBUG: append the canvas element (not the ctx!)
  document.body.appendChild(this.collisionCanvas);

  this.collisionCanvas.style.position = "absolute";
  this.collisionCanvas.style.top = "0";
  this.collisionCanvas.style.left = "0";
  this.collisionCanvas.style.border = "1px solid red";
  */

  // KEYS
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // GET CAMERA INFO
  const mainCamera = this.cameras.main;
  const cameraViewWidth = mainCamera.width;
  const cameraViewHeight = mainCamera.height;

  // WORLD BOUNDS SETUP
  this.physics.world.setBounds(
    0 - worldWidth / 2,
    0 - worldHeight / 2,
    worldWidth,
    worldHeight,
    true,
    true,
    true,
    true
  );

  // PLAYER SETUP
  const worldStartCoordX = cameraViewWidth / 2;
  const worldStartCoordY = cameraViewHeight / 2;
  this.player = this.physics.add
    .sprite(worldStartCoordX, worldStartCoordY, "player")
    .setScale(0.15);
  this.player.setBounce(0.2);
  this.player.setCollideWorldBounds(true);
  this.player.canFire = true;
  this.player.turnRate = 4;
  this.player.speed = 2.5;
  this.player.setDamping(true);
  this.player.setDrag(0.999);
  this.player.setMaxVelocity(450);
  this.player.setAngle(-90);

  // PLAYER SMOKE EMITTER
  this.emitter = this.add.particles(0, 0, "star", {
    speed: { min: -200, max: -100 },
    //angle: { min: 170, max: 190 },
    lifespan: 300,
    quantity: 2,
    scale: { start: 0.3, end: 0 },
    alpha: { start: 0, end: 1.0 },
    emitting: false,
  });
  this.emitter.onParticleEmit((particle) => {
    const angleOffset = -180;
    let angleInDegrees =
      this.player.angle + angleOffset + Phaser.Math.Between(-7, 7); // Or set it based on input
    let velocity = this.physics.velocityFromAngle(
      angleInDegrees,
      this.player.speed * 500
    );
    particle.velocityX = velocity.x; //+ Phaser.Math.Between(-200, 200);
    particle.velocityY = velocity.y; // + Phaser.Math.Between(-200, 200);
  });
  this.emitter.startFollow(this.player);

  // CAMERA FOLLOWS PLAYER
  this.cameras.main.startFollow(this.player);
  // CREATE STARS
  for (let i = 0; i < starsToAdd; i++) {
    const x = Phaser.Math.Between(0 - cameraViewWidth * 2, cameraViewWidth * 3);
    const y = Phaser.Math.Between(0, cameraViewHeight);
    let star = this.add.image(x, y, "star").setScale(0.05);
    staticStars.push(star);
  }

  // SETUP MESSAGES

  say("walter", "Hello there.", 1, this);
  say("walter", "I am Amaguma.", 1, this);
  say("john", "Howdy.", 1, this);
  /*
  say(
    "andrew",
    "John I'm sick of your shitposts,\nI'm deleting the shitposting channel",
    1,
    this
  );
  say(
    "john",
    "You can't do this to me!!\nDo you know how much I've sacrificed!?!!?",
    1,
    this
  );
  say(
    "andrew",
    "This discord deserves a better class of citizen\n you will pay for your shitposts\nI've already planned what will be the biggest attack since...",
    0,
    this
  );
  say("marshall", "woah let's keep it PG edge lord", 1, this);
  say(
    "andrew",
    "Johns shitposting has gotten out of hand\n as a punishment at 3:22, JD will...",
    0,
    this
  );
  say("jd", "STEAL YOUR LETTUCE!!!!", 2, this);
  say("john", "NOOOOOOOOOOOOOOOOOOOOOOO!!!!", 2, this);
  say(
    "walter",
    "*monotone*\n Do not worry, I will provide you with\n tech support to stop JD.",
    2,
    this
  );
  say("marshall", "And I can do your taxes.", 1, this);
  say("nancie", "June and I can help too :3", 1, this);
  say(
    "john",
    "Thank you all for your support. I just wish...\nJoe Biden were here...",
    2,
    this
  );
  say("joebiden", "Did somebody say corn pop?", 2, this);
  say(
    "andrew",
    "Your demented old man can't\n save your lettuce. \nJD go get him!",
    1,
    this
  );
  say("jd", "It's morbin time.", 1, this);
  say("walter", "Look out!", 1, this);
  */

  initializeMessagesChain();

  //console.log(this.asteroids.length);
  //this.physics.world.createDebugGraphic();

  this.planets = this.physics.add.staticGroup();
  this.bullets = this.physics.add.group();
  this.asteroids = this.physics.add.group();

  // SETUP ASTEROIDS
  for (let i = 0; i < 100; i++) {
    let asteroid = createAsteroid(
      this,
      Phaser.Math.Between(-0.5 * worldWidth, 0.5 * worldWidth),
      Phaser.Math.Between(-0.5 * worldHeight, 0.5 * worldHeight),
      Phaser.Math.Between(3, 10) * 0.1
    );
  }

  // SETUP PLANETS
  let planetsSpawned: any[] = [];
  const amount = 10;
  for (let x = 1; x < amount; x++) {
    const spawnX = (worldWidth / amount) * x - worldWidth * 0.5;
    const spawnY = Phaser.Math.Between(-0.3 * worldHeight, worldHeight * 0.3);
    const sprites = ["earthplanet", "ringplanet", "gasplanet"];
    const spriteSelect = sprites[Phaser.Math.Between(0, 2)];
    let planet = this.planets.create(spawnX, spawnY, spriteSelect);
    planet.setScale(0.1 * Phaser.Math.Between(5, 15));
    planetsSpawned.push(planet);
    if (planetsSpawned.length > 1) {
      let previousPlanet = planetsSpawned[planetsSpawned.length - 2];
      const line = this.add.line(
        0,
        0,
        previousPlanet.x,
        previousPlanet.y,
        planet.x,
        planet.y,
        0xffffff
      );
      line.setOrigin(0, 0);
    }
    const planetName = getRandomPlanetName();
    const text = this.add.text(
      planet.x,
      planet.y + planet.displayHeight / 2 + 5,
      planetName,
      { font: "16px Arial", color: "#ffffff" }
    );
    text.setOrigin(0.5, 0);
  }

  this.physics.add.collider(this.asteroids, this.asteroids);

  this.physics.add.collider(
    this.bullets,
    this.asteroids,
    (bullet, asteroid) => {
      if (asteroid.scale >= 0.5) {
        let smallAsteroid1 = createAsteroid(
          this,
          asteroid.x,
          asteroid.y,
          asteroid.scale / 3
        );
        let smallAsteroid2 = createAsteroid(
          this,
          asteroid.x,
          asteroid.y,
          asteroid.scale / 3
        );
      }

      bullet.destroy();
      asteroid.destroy();
    }
  );

  this.physics.add.overlap(
    this.player,
    this.asteroids,
    (player, asteroid) => {
      if (pixelPerfectCheck(player, asteroid, this.ctx)) {
        player.body.velocity.negate();
        player.x += player.body.velocity.x * 0.05;
        player.y += player.body.velocity.y * 0.05;
      }
    },
    null,
    this
  );
}

function update() {
  // PLAYER CONTROLS
  let cursors = this.input.keyboard.createCursorKeys();

  // LEFT AND RIGHT
  if (cursors.left.isDown || keyA.isDown) {
    this.player.setAngle(this.player.angle - this.player.turnRate);
  } else if (cursors.right.isDown || keyD.isDown) {
    this.player.setAngle(this.player.angle + this.player.turnRate);
  }

  // UP AND DOWN
  if (cursors.up.isDown || keyW.isDown) {
    let angleInDegrees = this.player.angle; // Or set it based on input
    let velocity = this.physics.velocityFromAngle(
      angleInDegrees,
      this.player.speed
    );
    this.player.body.setVelocity(
      this.player.body.velocity.x + velocity.x,
      this.player.body.velocity.y + velocity.y
    );
    this.emitter.emitting = true;
    this.player.setTexture("playerflame");
  } else {
    this.player.setTexture("player");
    this.emitter.emitting = false;
    this.player.setAcceleration(0); // needed
  }

  // SHOOTING
  if (keySpace.isDown && this.player.canFire) {
    let bullet = this.bullets
      .create(this.player.x, this.player.y, "playerbullet")
      .setScale(0.25);
    bullet.setBounce(0.0);
    bullet.setCollideWorldBounds(true);
    bullet.setAngle(this.player.angle);
    bullet.velocity = this.physics.velocityFromAngle(this.player.angle, 700);
    bullet.body.setVelocity(
      this.player.body.velocity.x + bullet.velocity.x,
      this.player.body.velocity.y + bullet.velocity.y
    );
    this.player.canFire = false;
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.player.canFire = true;
      },
    });
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        bullet.destroy();
      },
    });
  }

  // GRAVITY
  this.graphics.clear();
  this.planets.children.iterate((planet: any) => {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      planet.x,
      planet.y
    );

    if (distance < gravityDistance) {
      this.graphics.lineStyle(2, 0xff0000, 1);
      this.graphics.beginPath();
      this.graphics.moveTo(planet.x, planet.y);
      this.graphics.lineTo(this.player.x, this.player.y);
      this.graphics.strokePath();

      let angleToPlanet = Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          planet.x,
          planet.y
        )
      );
      let gravVel = this.physics.velocityFromAngle(
        angleToPlanet,
        gravityStrength * (1 - distance / gravityDistance)
      );
      this.player.body.setVelocity(
        gravVel.x + this.player.body.velocity.x,
        gravVel.y + this.player.body.velocity.y
      );
    }
  });

  // STAR REFRESHING
  const allStars: Phaser.GameObjects.Image[] = [...staticStars];
  allStars.forEach((star: Phaser.GameObjects.Image) => {
    const bounds = star.getBounds();
    const cam = this.cameras.main.worldView;
    if (bounds.top > cam.bottom) {
      star.setY(star.y - cam.height);
    } else if (bounds.bottom < cam.top) {
      star.setY(star.y + cam.height);
    }
    if (bounds.left > cam.right) {
      star.setX(star.x - cam.width);
    } else if (bounds.right < cam.left) {
      star.setX(star.x + cam.width);
    }
  });

  // EVERYTHING ELSE
  needsUpdateCall.forEach((x) => x.update());
}

function say(character: string, text: string, time: number, level: any) {
  let display = new TextDisplay(level, text, time, character);
  messages.push(display);
  return display;
}

function initializeMessagesChain() {
  for (let i = 1; i < messages.length; i++) {
    messages[i - 1].next = () => messages[i].start && messages[i].start();
  }
  needsUpdateCall = [...needsUpdateCall, ...messages];
  messages[0].start();
}

export function getLevel1(): Level {
  const value = {
    name: "Sea Legs",
    preload: preload,
    create: create,
    update: update,
    getConfig: getConfig,
  } as Level;

  return value;
}
