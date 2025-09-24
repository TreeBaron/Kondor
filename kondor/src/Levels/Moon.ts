import { createAsteroid } from "./Helper.ts";
import { Player } from "../GameObjects/player.ts";
import { getHillHeight } from "./Helper.ts";
import { pixelPerfectCheck } from "./Helper.ts";
import { CustomLevel } from "./CustomLevel.ts";

export class Moon extends CustomLevel {
  // World Definition fields
  worldWidth: number = 6_000;
  worldHeight: number = 6_000;
  starsToAdd: number = 900;
  gravityDistance: number = 1500;
  gravityStrength: number = 4;

  // Object fields
  asteroids!: Phaser.Physics.Arcade.Group;
  hills: any[] = [];
  hillColliders!: Phaser.Physics.Arcade.StaticGroup;
  landingPads!: Phaser.Physics.Arcade.StaticGroup;
  staticStars: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super({ key: "Moon" });
  }

  preload(): void {
    this.loadAllAssets();
  }

  create(): void {
    this.graphics = this.add.graphics();

    // Set gravity and background color
    this.cameras.main.setBackgroundColor("#000000");
    this.physics.world.gravity.y = 50;

    this.setupPreciseCollision();

    this.setupKeys();

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

    // Place Landing Pad and town
    this.add.sprite(2030, 2830, "peopletown").setScale(1.0).setDepth(-100);
    this.landingPads = this.physics.add.staticGroup([
      this.add.sprite(2160, 2730, "landingpad").setScale(0.5).setDepth(1),
    ]);

    this.cameras.main.setZoom(0.5);

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

    this.setupUICam([this.bullets]);
  }

  update(time: number, delta: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // SMART CAM
    this.smartCam(this.player, this);

    // UPDATE PLAYER
    this.player.customLogic(this);

    // DRAW LAND
    this.graphics.clear();

    this.graphics.lineStyle(2, 0x787878, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(this.worldWidth * -0.75, this.worldHeight * 0.5);
    this.graphics.lineTo(this.worldWidth * 0.75, this.worldHeight * 0.5);
    this.graphics.strokePath();

    this.graphics.fillStyle(0x787878, 1);
    this.hills.forEach((hill) => {
      this.graphics.fillRect(hill.x, hill.y, hill.width, hill.height);
    });

    // EVERYTHING ELSE
    this.needsUpdateCall.forEach((x) => x.update());

    // EXIT
    if (this.player.y < this.worldHeight * -0.5 + 200) {
      this.scene.switch("SpaceMap");
    }
  }

  startLevel() {
    this.player.setPosition(0, 0);
  }
}
