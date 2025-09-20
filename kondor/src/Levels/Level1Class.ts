import {
  createAsteroid,
  inXSeconds,
  pixelPerfectCheck,
  getRandomPlanetName,
  getPlayerSpaceZone,
} from "./Helper.ts";
import { TextDisplay } from "./TextDisplay.ts";

class Level1 extends Phaser.Scene {
  // World Definition fields
  worldWidth: number = 12_000;
  worldHeight: number = 12_000;
  starsToAdd: number = 100;
  gravityDistance: number = 1500;
  gravityStrength: number = 4;
  needsUpdateCall: any[] = [];
  messages: TextDisplay[] = [];

  // Object fields
  player!: Player;
  bullets!: Phaser.Physics.Arcade.Group;
  asteroids!: Phaser.Physics.Arcade.Group;
  planets!: Phaser.Physics.Arcade.StaticGroup;
  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  staticStars: Phaser.GameObjects.Image[] = [];

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
    super({ key: "Level1" });
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

    // COLLISION DETECTION CANVAS
    this.collisionCanvas = document.createElement("canvas");
    this.collisionCanvas.width = 256;
    this.collisionCanvas.height = 256;
    this.collisionCanvasContext = this.collisionCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    /*
  // DEBUG: append the canvas element (not the ctx!)
  document.body.appendChild(this.collisionCanvas);

  this.collisionCanvas.style.position = "absolute";
  this.collisionCanvas.style.top = "0";
  this.collisionCanvas.style.left = "0";
  this.collisionCanvas.style.border = "1px solid red";
  */

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
    this.player = getPlayerSpaceZone(this, worldStartCoordX, worldStartCoordY);

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

    //console.log(this.asteroids.length);
    //this.physics.world.createDebugGraphic();

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
  }

  update(time: number, delta: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // PLAYER CONTROLS
    const inputManager = this.input as Phaser.Input.InputPlugin;
    const keyboard =
      inputManager.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    let cursors = keyboard.createCursorKeys();

    // LEFT AND RIGHT
    if (cursors.left.isDown || this.keyA.isDown) {
      this.player.setAngle(this.player.angle - this.player.turnRate);
    } else if (cursors.right.isDown || this.keyD.isDown) {
      this.player.setAngle(this.player.angle + this.player.turnRate);
    }

    // UP AND DOWN
    if (cursors.up.isDown || this.keyW.isDown) {
      let angleInDegrees = this.player.angle; // Or set it based on input
      let velocity = this.physics.velocityFromAngle(
        angleInDegrees,
        this.player.speed
      );

      playerBody.setVelocity(
        playerBody.velocity.x + velocity.x,
        playerBody.velocity.y + velocity.y
      );
      this.emitter.emitting = true;
      this.player.setTexture("playerflame");
    } else {
      this.player.setTexture("player");
      this.emitter.emitting = false;
      this.player.setAcceleration(0); // needed
    }

    // SHOOTING
    if (this.keySpace.isDown && this.player.canFire) {
      let bullet = this.bullets
        .create(this.player.x, this.player.y, "playerbullet")
        .setScale(0.25);
      bullet.setBounce(0.0);
      bullet.setCollideWorldBounds(true);
      bullet.setAngle(this.player.angle);
      bullet.velocity = this.physics.velocityFromAngle(this.player.angle, 700);
      bullet.body.setVelocity(
        playerBody.velocity.x + bullet.velocity.x,
        playerBody.velocity.y + bullet.velocity.y
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
