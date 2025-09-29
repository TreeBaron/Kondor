import { createAsteroid } from "./Helper.ts";
import { Player } from "../GameObjects/player.ts";
import { getHillHeight } from "./Helper.ts";
import { pixelPerfectCheck } from "./Helper.ts";
import { CustomLevel } from "./CustomLevel.ts";
import { EditorPlayer } from "../GameObjects/editorPlayer.ts";

export class LevelEditor extends CustomLevel {
  // World Definition fields
  worldWidth: number = 30_000;
  worldHeight: number = 30_000;

  editor!: EditorPlayer;

  // Object fields
  staticObjects: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super({ key: "LevelEditor" });
  }

  preload(): void {
    this.loadAllAssets();
  }

  create(): void {
    this.graphics = this.add.graphics();

    this.drawGrid(200, 0x00ff00);

    // Set gravity and background color
    this.cameras.main.setBackgroundColor("#000000");

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
    this.editor = new EditorPlayer(this, worldStartCoordX, worldStartCoordY);

    // CAMERA FOLLOWS PLAYER
    this.cameras.main.startFollow(this.editor);

    this.cameras.main.setZoom(1.0);

    this.setupUICam([]);
  }

  update(time: number, delta: number): void {
    const playerBody = this.editor.body as Phaser.Physics.Arcade.Body;

    // UPDATE PLAYER
    this.editor.customLogic(this);
  }

  startLevel() {
    this.editor.setPosition(0, 0);
  }

  drawGrid(spacing: number, color: number) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, color, 1);

    const width = this.worldWidth;
    const height = this.worldHeight;

    for (let x = width * -0.5; x <= width * 0.5; x += spacing) {
      graphics.beginPath();
      graphics.moveTo(x, height * -0.5);
      graphics.lineTo(x, height * 0.5);
      graphics.strokePath();
    }

    for (let y = height * -0.5; y <= height * 0.5; y += spacing) {
      graphics.beginPath();
      graphics.moveTo(width * 0.5, y);
      graphics.lineTo(width * -0.5, y);
      graphics.strokePath();
    }
  }
}
