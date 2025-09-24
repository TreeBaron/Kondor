import { Player } from "../GameObjects/player";
import { TextDisplay } from "./TextDisplay.ts";

export class CustomLevel extends Phaser.Scene {
  uiElements: any[] = [];
  hudCam!: Phaser.Cameras.Scene2D.Camera;
  player!: Player;
  worldWidth?: number;
  worldHeight?: number;
  needsUpdateCall: any[] = [];
  messages: TextDisplay[] = [];

  // Objects
  bullets!: Phaser.Physics.Arcade.Group;

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

  smartCam(player: Phaser.GameObjects.Sprite, level: CustomLevel): void {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const totalVelocity =
      Math.abs(playerBody.velocity.x) + Math.abs(playerBody.velocity.y);
    const totalVelocityX = Math.abs(playerBody.velocity.x);
    const totalVelocityY = Math.abs(playerBody.velocity.y);
    const zoomDFactor = 600.0;
    const moveDFactor = 150.0;

    // PLAYER CAM OFFSET
    const engageSpeed = 5;
    let desiredOffset = { x: 0, y: 0 };
    if (Math.abs(playerBody.velocity.x) > engageSpeed) {
      desiredOffset.x =
        (level.cameras.main.displayWidth / 4.0) *
        (playerBody.velocity.x > 0 ? -1 : 1);
    } else {
      desiredOffset.x = 0;
    }

    if (Math.abs(playerBody.velocity.y) > engageSpeed) {
      desiredOffset.y =
        (level.cameras.main.displayHeight / 4.0) *
        (playerBody.velocity.y > 0 ? -1 : 1);
    } else {
      desiredOffset.y = 0;
    }

    if (totalVelocityX < 200) {
      desiredOffset.x = 0;
    }

    if (totalVelocityY < 200) {
      desiredOffset.y = 0;
    }

    let currentOffset = level.cameras.main.followOffset;
    let xAdjust = Math.abs(
      Math.abs(currentOffset.x - desiredOffset.x) / moveDFactor
    );
    let yAdjust = Math.abs(
      Math.abs(currentOffset.y - desiredOffset.y) / moveDFactor
    );
    let finalX = 0;
    let finalY = 0;
    if (currentOffset.x > desiredOffset.x) {
      finalX -= xAdjust;
    } else {
      finalX += xAdjust;
    }

    if (currentOffset.y > desiredOffset.y) {
      finalY -= yAdjust;
    } else {
      finalY += yAdjust;
    }

    level.cameras.main.setFollowOffset(
      currentOffset.x + finalX,
      currentOffset.y + finalY
    );

    // ZOOM
    let desiredZoom = 1.0;
    //console.log(totalVelocity);
    if (totalVelocity > 200) {
      desiredZoom = 0.5;
    } else if (totalVelocity > 75) {
      desiredZoom = 1.0;
    } else if (totalVelocity > 25) {
      desiredZoom = 1.5;
    } else {
      desiredZoom = 2.0;
    }

    let actualZoom = this.cameras.main.zoom;
    let zoomAdjust = Math.abs(desiredZoom - actualZoom) / zoomDFactor;
    if (desiredZoom > actualZoom) {
      this.cameras.main.setZoom(actualZoom + zoomAdjust);
    } else {
      this.cameras.main.setZoom(actualZoom - zoomAdjust);
    }
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

  setupKeys(): void {
    // KEYS
    const inputManager = this.input as Phaser.Input.InputPlugin;
    const keyboard =
      inputManager.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  setupPreciseCollision(): void {
    // COLLISION DETECTION CANVAS
    this.collisionCanvas = document.createElement("canvas");
    this.collisionCanvas.width = 256;
    this.collisionCanvas.height = 256;
    this.collisionCanvasContext = this.collisionCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
  }

  setupUICam(others: any[]): void {
    // SETUP UI CAMERA
    this.hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.ignore(
      this.children.list.filter((x) => this.uiElements.includes(x))
    );
    this.hudCam.ignore([
      ...others,
      this.children.list.filter((x) => !this.uiElements.includes(x)),
    ]);
  }

  loadAllAssets(): void {
    //console.log("preload() started.");

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
    this.load.image("landingpad", "assets/landingpad.png");
    this.load.image("peopletown", "assets/peopletown.png");
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
}
