import { inXSeconds } from "./Helper.ts";
import { Level } from "./LevelClass.ts";
import { TextDisplay } from "./TextDisplay.ts";

const cameraOffsetY = 0;
const worldThirdOfWidth = 920;
const worldHeight = 1000 * 35;
const starSpeed1 = -1.5;
const starSpeed2 = -0.5;
const starsToAdd = 100;
const movingStarsToAdd1 = 250;
const movingStarsToAdd2 = 200;

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
    roundPixels: true,
    pixelArt: true,
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
    0 - worldThirdOfWidth,
    0 - worldHeight,
    worldThirdOfWidth * 2,
    worldHeight,
    true,
    true,
    true,
    true
  );

  // PLAYER SETUP
  /*
  this.anims.create({
    key: "straight",
    frames: this.anims.generateFrameNumbers("player", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  */
  const worldStartCoordX = cameraViewWidth / 2;
  const worldStartCoordY = cameraViewHeight / 2 + cameraOffsetY;
  player = this.physics.add
    .sprite(worldStartCoordX, worldStartCoordY, "player")
    .setScale(0.25);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.canFire = true;
  player.turnRate = 4;
  player.speed = 2.5;
  player.body.setDamping(true);
  player.body.setDrag(0.999);
  player.body.setMaxVelocity(450);

  // PLAYER SMOKE EMITTER
  this.emitter = this.add.particles(0, 0, "star", {
    speed: { min: -200, max: -100 },
    angle: { min: 170, max: 190 },
    lifespan: 300,
    quantity: 2,
    scale: { start: 0.3, end: 0 },
    alpha: { start: 0, end: 1.0 },
    emitting: false,
  });
  this.emitter.onParticleEmit((particle) => {
    const angleOffset = -90 - 180;
    let angleInDegrees = player.angle + angleOffset; // Or set it based on input
    let velocity = this.physics.velocityFromAngle(
      angleInDegrees,
      player.speed * 500
    );
    particle.velocityX = velocity.x + Phaser.Math.Between(-200, 200);
    particle.velocityY = velocity.y + Phaser.Math.Between(-200, 200);
  });
  this.emitter.startFollow(player);

  // CAMERA FOLLOWS PLAYER
  this.cameras.main.startFollow(player);
  this.cameras.main.setFollowOffset(0, cameraOffsetY);
  //this.cameras.main.setLerp({0.1, 0.1});

  // CREATE STARS
  for (let i = 0; i < starsToAdd; i++) {
    const x = Phaser.Math.Between(0 - cameraViewWidth * 2, cameraViewWidth * 3);
    const y = Phaser.Math.Between(0, cameraViewHeight + cameraOffsetY);
    let star = this.add.image(x, y, "star").setScale(0.05);
    staticStars.push(star);
  }

  // SETUP MESSAGES

  say("walter", "Hello there.", 1, this);
  say("walter", "I am Amaguma.", 1, this);
  say("john", "I see...", 1, this);
  say("walter", "Bush did 9/11", 1, this);
  say("john", "WHAT!??", 1, this);
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
}

function update() {
  // PLAYER CONTROLS
  let cursors = this.input.keyboard.createCursorKeys();

  // LEFT AND RIGHT
  if (cursors.left.isDown || keyA.isDown) {
    player.setAngle(player.angle - player.turnRate);
  } else if (cursors.right.isDown || keyD.isDown) {
    player.setAngle(player.angle + player.turnRate);
  }

  // UP AND DOWN
  if (cursors.up.isDown || keyW.isDown) {
    const angleOffset = -90;
    let angleInDegrees = player.angle + angleOffset; // Or set it based on input
    let velocity = this.physics.velocityFromAngle(angleInDegrees, player.speed);
    player.body.setVelocity(
      player.body.velocity.x + velocity.x,
      player.body.velocity.y + velocity.y
    );
    this.emitter.emitting = true;
    player.setTexture("playerflame");
  } else {
    player.setTexture("player");
    this.emitter.emitting = false;
    player.setAcceleration(0); // needed
  }

  // SHOOTING
  if (keySpace.isDown && player.canFire) {
    let bullet = this.physics.add.sprite(
      player.x,
      player.y - 50,
      "playerbullet"
    );
    bullet.setBounce(1.0);
    bullet.setCollideWorldBounds(true);
    bullet.setAngle(Phaser.Math.Between(0, 360));
    bullet.setVelocityY(-900);
    player.canFire = false;
    this.time.addEvent({
      delay: 500,
      callback: () => (player.canFire = true),
    });
  }

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
