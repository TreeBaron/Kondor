import { createAsteroid } from "./Helper.ts";
import { TextDisplay } from "./TextDisplay.ts";
import { Player } from "../GameObjects/player.ts";
import { getHillHeight } from "./Helper.ts";
import { pixelPerfectCheck } from "./Helper.ts";

export class Level2 extends Phaser.Scene {
  // World Definition fields
  worldWidth: number = 6_000;
  worldHeight: number = 6_000;
  starsToAdd: number = 900;
  gravityDistance: number = 1500;
  gravityStrength: number = 4;
  needsUpdateCall: any[] = [];
  messages: TextDisplay[] = [];

  // Object fields
  player!: Player;
  bullets!: Phaser.Physics.Arcade.Group;
  asteroids!: Phaser.Physics.Arcade.Group;
  hills: any[] = [];
  hillColliders!: Phaser.Physics.Arcade.StaticGroup;
  landingPads!: Phaser.Physics.Arcade.StaticGroup;
  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  staticStars: Phaser.GameObjects.Sprite[] = [];

  // Support fields
  graphics!: Phaser.GameObjects.Graphics;
  collisionCanvas!: HTMLCanvasElement;
  collisionCanvasContext!: CanvasRenderingContext2D;

  // Key inputs
  keyW!: Phaser.Input.Keyboard.Key;
  keyA!: Phaser.Input.Keyboard.Key;
  keyS!: Phaser.Input.Keyboard.Key;
  keyD!: Phaser.Input.Keyboard.Key;
  keySpace!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "Level2" });
  }

  preload(): void {
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

  create(): void {
    this.graphics = this.add.graphics();

    // Set gravity and background color
    this.cameras.main.setBackgroundColor("#30184a");
    this.physics.world.gravity.y = 50;

    // COLLISION DETECTION CANVAS
    this.collisionCanvas = document.createElement("canvas");
    this.collisionCanvas.width = 256;
    this.collisionCanvas.height = 256;
    this.collisionCanvasContext = this.collisionCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    // KEYS
    const inputManager = this.input as Phaser.Input.InputPlugin;
    const keyboard =
      inputManager.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // GET CAMERA INFO
    const mainCamera = this.cameras.main;
    const cameraViewWidth = mainCamera.width;
    const cameraViewHeight = mainCamera.height;

    // WORLD BOUNDS SETUP
    this.physics.world.setBounds(
      0 - this.worldWidth / 2,
      0 - this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      true,
      true,
      true,
      true
    );

    // PLAYER SETUP
    const worldStartCoordX = cameraViewWidth / 2;
    const worldStartCoordY = cameraViewHeight / 2;
    this.player = new Player(this, worldStartCoordX, worldStartCoordY);

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
    this.emitter.onParticleEmit((particle: any) => {
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

    // CREATE LAND
    let leftCorner = { x: this.worldWidth * -0.75, y: this.worldHeight * 0.5 };
    let rightCorner = { x: this.worldWidth * 0.75, y: this.worldHeight * 0.5 };

    let increment = 5;
    let heightSelect = 0;
    for (let x = leftCorner.x; x < rightCorner.x; x += increment) {
      let height = getHillHeight(x, 25); //+ Phaser.Math.Between(10, 30);
      let width = increment;
      let xVal = x;
      let yVal = rightCorner.y;
      this.hills.push({
        x: xVal - width / 2,
        y: yVal - height / 2,
        width: width,
        height: height,
      });
      heightSelect++;
    }

    // Place Landing Pad
    this.landingPads = this.physics.add.staticGroup([
      this.add.sprite(2080, 2830, "landingpad").setScale(0.75).setDepth(1),
    ]);
    this.physics.add.overlap(
      this.player,
      this.landingPads,
      (playerShip: any, landingPad: any) => {
        if (
          pixelPerfectCheck(playerShip, landingPad, this.collisionCanvasContext)
        ) {
          const playerBody: Phaser.Physics.Arcade.Body =
            playerShip.body as Phaser.Physics.Arcade.Body;
          playerBody.position.y -= 0.1;
          playerBody.setVelocityY(0);
          playerBody.setVelocityX(playerBody.velocity.x * 0.9);
        }
      },
      undefined,
      this
    );

    this.hillColliders = this.physics.add.staticGroup(
      //this.add.rectangle(100, 100, 200, 20).setOrigin(0, 0).setVisible(false),
      this.hills.map((h) =>
        this.add
          .rectangle(h.x, h.y, h.width, h.height)
          .setOrigin(0, 0)
          .setVisible(true)
      )
    );

    // Hill collisions
    this.physics.add.collider(this.player, this.hillColliders);

    // Below ground
    this.hills.push({
      x: leftCorner.x,
      y: rightCorner.y,
      width: this.worldWidth * 2,
      height: 1200,
    });

    // CREATE STARS
    for (let i = 0; i < this.starsToAdd; i++) {
      const x = Phaser.Math.Between(
        this.worldWidth * -0.7, // Exceed map size for camera view
        this.worldWidth * 0.7
      );
      const y = Phaser.Math.Between(
        this.worldHeight * -0.5,
        this.worldHeight * 0.5
      ); // don't show near ground;
      let star = this.add.sprite(x, y, "star").setScale(0.1);
      star.setDepth(-100);
      this.staticStars.push(star);
    }

    // SETUP MESSAGES
    this.say("andrew", "Welcome to level 2 bitch.", 1, this);
    this.say("john", "Thanks.", 1, this);

    this.initializeMessagesChain();

    //console.log(this.asteroids.length);
    //this.physics.world.createDebugGraphic();

    this.bullets = this.physics.add.group();

    this.physics.add.collider(
      this.bullets,
      this.asteroids,
      (bullet: any, asteroid: any) => {
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
  }

  update(time: number, delta: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // UPDATE PLAYER
    this.player.customLogic(this);

    // DRAW LAND
    this.graphics.clear();

    this.graphics.lineStyle(2, 0x0b8f04, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(this.worldWidth * -0.75, this.worldHeight * 0.5);
    this.graphics.lineTo(this.worldWidth * 0.75, this.worldHeight * 0.5);
    this.graphics.strokePath();

    this.graphics.fillStyle(0x0b8f04, 1);
    this.hills.forEach((hill) => {
      this.graphics.fillRect(hill.x, hill.y, hill.width, hill.height);
    });

    // EVERYTHING ELSE
    this.needsUpdateCall.forEach((x) => x.update());
  }

  say(character: string, text: string, time: number, level: any): TextDisplay {
    let display = new TextDisplay(level, text, time, character);
    this.messages.push(display);
    return display;
  }

  initializeMessagesChain(): void {
    for (let i = 1; i < this.messages.length; i++) {
      this.messages[i - 1].next = () =>
        this.messages[i].start && this.messages[i].start();
    }
    this.needsUpdateCall = [...this.needsUpdateCall, ...this.messages];
    this.messages[0].start();
  }
}
