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
  this.load.spritesheet("player", "assets/planes_08A.png", {
    frameWidth: 96,
    frameHeight: 96,
    endFrame: 19,
  });

  // CHARACTERS
  this.load.image("nensi", "assets/Nensi_B.png");
  this.load.image("anya", "assets/Anya_B.png");
  this.load.image("dimitri", "assets/Dimitri_B.png");
  this.load.image("alexi", "assets/Alexi_B.png");
}

// create is called once, after preload
function create() {
  console.log("create() started.");

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
  say("nensi", "Hello there.", 3, this);
  say("anya", "General Kenobi.", 3, this);
  //say("anya", "General Kenobi", 15, this);
  initializeMessagesChain();
}

function update() {
  // PLAYER CONTROLS
  let cursors = this.input.keyboard.createCursorKeys();

  // LEFT AND RIGHT
  if (cursors.left.isDown) {
    player.setVelocityX(-1 * playerSpeedLeftAndRight);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeedLeftAndRight);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("straight", true);
  }

  // UP AND DOWN
  if (cursors.up.isDown) {
    player.setVelocityY(-1 * playerSpeedForward);
  } else if (cursors.down.isDown) {
    player.setVelocityY(0);
  } else {
    player.setVelocityY(0);
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
