import {
  createAsteroid,
  pixelPerfectCheck,
  getRandomPlanetName,
} from "./Helper.ts";
import { Player } from "../GameObjects/player.ts";
import { CustomLevel } from "./CustomLevel.ts";
import { Planet } from "../GameObjects/planet.ts";

export class SpaceMap extends CustomLevel {
  // World Definition fields
  worldWidth: number = 12_000;
  worldHeight: number = 12_000;
  starsToAdd: number = 100;
  gravityDistance: number = 1500;
  gravityStrength: number = 4;

  // Object fields
  asteroids!: Phaser.Physics.Arcade.Group;
  planets!: Phaser.Physics.Arcade.StaticGroup;
  staticStars: Phaser.GameObjects.Image[] = [];

  constructor() {
    super({ key: "SpaceMap" });
  }

  preload(): void {
    this.loadAllAssets();
  }

  create(): void {
    this.graphics = this.add.graphics();

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

    // CREATE STARS
    for (let i = 0; i < this.starsToAdd; i++) {
      const x = Phaser.Math.Between(
        0 - cameraViewWidth * 2,
        cameraViewWidth * 3
      );
      const y = Phaser.Math.Between(0, cameraViewHeight);
      let star = this.add.image(x, y, "star").setScale(0.05);
      this.staticStars.push(star);
    }

    // SETUP MESSAGES
    this.say("walter", "Hello there.", 1, this);
    this.say("walter", "I am Amaguma.", 1, this);
    this.say("john", "Howdy.", 1, this);

    this.initializeMessagesChain();

    this.planets = this.physics.add.staticGroup();
    this.bullets = this.physics.add.group();
    this.asteroids = this.physics.add.group();

    // SETUP ASTEROIDS
    for (let i = 0; i < 100; i++) {
      let asteroid = createAsteroid(
        this,
        Phaser.Math.Between(-0.5 * this.worldWidth, 0.5 * this.worldWidth),
        Phaser.Math.Between(-0.5 * this.worldHeight, 0.5 * this.worldHeight),
        Phaser.Math.Between(3, 10) * 0.1
      );
    }

    // SETUP PLANETS
    let planetsSpawned: any[] = [];
    const amount = 10;
    for (let x = 1; x < amount; x++) {
      const spawnX = (this.worldWidth / amount) * x - this.worldWidth * 0.5;
      const spawnY = Phaser.Math.Between(
        -0.3 * this.worldHeight,
        this.worldHeight * 0.3
      );
      const sprites = ["earthplanet", "ringplanet", "gasplanet"];
      const spriteSelect = sprites[Phaser.Math.Between(0, 2)];
      let planet = new Planet(this, spawnX, spawnY, spriteSelect);
      this.planets.add(planet);
      planet.setScale(0.25);
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

    this.physics.add.collider(this.player, this.planets, (player, planet) => {
      this.scene.switch("Moon");
    });

    this.physics.add.collider(this.asteroids, this.asteroids);

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

    this.physics.add.overlap(
      this.player,
      this.asteroids,
      (player: any, asteroid: any) => {
        const body = player.body as Phaser.Physics.Arcade.Body;
        if (pixelPerfectCheck(player, asteroid, this.collisionCanvasContext)) {
          body.velocity.negate();
          player.x += body.velocity.x * 0.05;
          player.y += body.velocity.y * 0.05;
        }
      },
      undefined,
      this
    );

    this.setupUICam([this.asteroids, this.bullets]);
  }

  update(time: number, delta: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // SMART CAM
    this.smartCam(this.player, this);

    // UPDATE PLAYER
    this.player.customLogic(this);

    // PLANET GRAVITY
    this.graphics.clear();
    this.planets.children.iterate((planet: any): null | boolean => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        planet.x,
        planet.y
      );

      if (distance < this.gravityDistance) {
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
          this.gravityStrength * (1 - distance / this.gravityDistance)
        );
        playerBody.setVelocity(
          gravVel.x + playerBody.velocity.x,
          gravVel.y + playerBody.velocity.y
        );
      }
      return null;
    });

    // STAR REFRESHING
    const allStars: Phaser.GameObjects.Image[] = [...this.staticStars];
    allStars.forEach((star: Phaser.GameObjects.Image) => {
      const bounds = star.getBounds();
      const originalX = star.x;
      const originalY = star.y;
      const cam = this.cameras.main.worldView;

      if (!Phaser.Geom.Intersects.RectangleToRectangle(bounds, cam)) {
        if (bounds.top > cam.bottom) {
          star.setY(star.y - cam.height - Phaser.Math.Between(0, 125));
        } else if (bounds.bottom < cam.top) {
          star.setY(star.y + cam.height + Phaser.Math.Between(0, 125));
        }
        if (bounds.left > cam.right) {
          star.setX(star.x - cam.width - Phaser.Math.Between(0, 125));
        } else if (bounds.right < cam.left) {
          star.setX(star.x + cam.width + Phaser.Math.Between(0, 125));
        }

        // If we accidently moved into view, undo it
        const newBounds = star.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(newBounds, cam)) {
          star.setX(originalX);
          star.setY(originalY);
        }
      }
    });

    // EVERYTHING ELSE
    this.needsUpdateCall.forEach((x) => x.update());
  }

  startLevel() {
    this.player.setPosition(0, 0);
  }
}
