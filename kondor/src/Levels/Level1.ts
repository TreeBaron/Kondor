import { inXSeconds } from "./Helper.ts";
import { Level } from "./LevelClass.ts";
import { TextDisplay } from "./TextDisplay.ts";

const cameraOffsetY = 280;
const playerSpeed = 250.0;
const worldThirdOfWidth = 920;
const worldHeight = 1000 * 35;
const playerSpeedLeftAndRight = 500;
const playerSpeedForward = 250;
const starSpeed1 = -1.5;
const starSpeed2 = -0.5;
const starsToAdd = 100;
const movingStarsToAdd1 = 250;
const movingStarsToAdd2 = 200;

let player;
let staticStars: Phaser.GameObjects.Image[] = [];
let movingStars1: Phaser.GameObjects.Image[] = [];
let movingStars2: Phaser.GameObjects.Image[] = [];
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

  // ANIMATIONS
  this.load.spritesheet("player", "assets/planes_08A.png", {
    frameWidth: 96,
    frameHeight: 96,
    endFrame: 19,
  });

  this.load.spritesheet("banana", "assets/spinningbanana.png", {
    frameWidth: 50,
    frameHeight: 25,
    endFrame: 9,
  });

  // CHARACTERS
  this.load.image("nensi", "assets/Nensi_B.png");
  this.load.image("anya", "assets/Anya_B.png");
  this.load.image("dimitri", "assets/Dimitri_B.png");
  this.load.image("alexi", "assets/Alexi_B.png");

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
  this.anims.create({
    key: "bananabanana",
    frames: this.anims.generateFrameNumbers("banana", {
      start: 0,
      end: 9,
      repeat: -1,
    }),
    frameRate: 10,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("player", {
      start: 12,
      end: 15,
    }),
    frameRate: 10,
  });

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("player", {
      start: 4,
      end: 7,
    }),
    frameRate: 10,
  });
  this.anims.create({
    key: "straight",
    frames: this.anims.generateFrameNumbers("player", {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  const worldStartCoordX = cameraViewWidth / 2;
  const worldStartCoordY = cameraViewHeight / 2 + cameraOffsetY;
  player = this.physics.add.sprite(
    worldStartCoordX,
    worldStartCoordY,
    "player"
  );
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.anims.play("straight", true);
  player.canFire = true;

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
  for (let i = 0; i < movingStarsToAdd1; i++) {
    const x = Phaser.Math.Between(0 - cameraViewWidth * 2, cameraViewWidth * 3);
    const y = Phaser.Math.Between(0, cameraViewHeight + cameraOffsetY);
    let star = this.add.image(x, y, "star").setScale(0.05);
    movingStars1.push(star);
  }
  for (let i = 0; i < movingStarsToAdd2; i++) {
    const x = Phaser.Math.Between(0 - cameraViewWidth * 2, cameraViewWidth * 3);
    const y = Phaser.Math.Between(0, cameraViewHeight + cameraOffsetY);
    let star = this.add.image(x, y, "star").setScale(0.05);
    movingStars2.push(star);
  }

  // SETUP MESSAGES
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

  //say("nensi", "Hello there.", 3, this);
  //say("anya", "General Kenobi.", 3, this);
  //say("anya", "General Kenobi", 15, this);
  initializeMessagesChain();
}

function update() {
  // PLAYER CONTROLS
  let cursors = this.input.keyboard.createCursorKeys();

  // LEFT AND RIGHT
  if (cursors.left.isDown || keyA.isDown) {
    player.setVelocityX(-1 * playerSpeedLeftAndRight);
    player.anims.play("left", true);
  } else if (cursors.right.isDown || keyD.isDown) {
    player.setVelocityX(playerSpeedLeftAndRight);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("straight", true);
  }

  // UP AND DOWN
  if (cursors.up.isDown || keyW.isDown) {
    player.setVelocityY(-1 * playerSpeedForward);
  } else if (cursors.down.isDown || keyS.isDown) {
    player.setVelocityY(0);
  } else {
    player.setVelocityY(0);
  }

  // SHOOTING
  if (keySpace.isDown && player.canFire) {
    let banana = this.physics.add.sprite(player.x, player.y - 50, "banana");
    banana.setBounce(1.0);
    banana.setCollideWorldBounds(true);
    banana.anims.play("bananabanana", true);
    banana.setAngle(Phaser.Math.Between(0, 360));
    banana.setVelocityY(-900);
    player.canFire = false;
    this.time.addEvent({
      delay: 500,
      callback: () => (player.canFire = true),
    });
  }

  // PLAYER ALWAYS MOVES
  player.setVelocityY(player.body.velocity.y - playerSpeed);

  // STAR REFRESHING
  const allStars: Phaser.GameObjects.Image[] = [
    ...staticStars,
    ...movingStars1,
    ...movingStars2,
  ];
  allStars.forEach((star: Phaser.GameObjects.Image) => {
    if (
      star.getBounds().y - star.getBounds().height >
      this.cameras.main.worldView.bottom
    ) {
      star.setPosition(star.x, star.y - this.cameras.main.worldView.height);
    }
  });
  movingStars1.forEach((star: Phaser.GameObjects.Image) => {
    star.setPosition(star.x, star.y - starSpeed1);
  });
  movingStars2.forEach((star: Phaser.GameObjects.Image) => {
    star.setPosition(star.x, star.y - starSpeed2);
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
    name: "Revolt in Pod 7",
    preload: preload,
    create: create,
    update: update,
    getConfig: getConfig,
  } as Level;

  return value;
}
