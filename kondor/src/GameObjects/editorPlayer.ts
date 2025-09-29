import { CustomLevel } from "../Levels/CustomLevel.ts";
import { LevelEditor } from "../Levels/LevelEditor.ts";

export class EditorPlayer extends Phaser.Physics.Arcade.Sprite {
  speed: number = 900.0;
  canFire: boolean = true;
  textObject!: Phaser.GameObjects.Text;
  objectInfoText!: Phaser.GameObjects.Text;
  debug: boolean = true;
  fineObjectSelect = 0.0;
  level!: LevelEditor;

  constructor(scene: LevelEditor, x: number, y: number) {
    super(scene, x, y, "editor");
    this.level = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.1);
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);
    this.setDamping(true);
    this.setDrag(0.999);
    this.setMaxVelocity(950);

    // Setup debug stuff
    if (this.debug) {
      this.textObject = scene.add.text(
        25,
        25,
        `Editor Position: ${Math.floor(x)},${Math.floor(y)}`,
        {
          fontFamily: "Roboto, Helvetica, comic sans, serif",
          fontSize: "24px",
          backgroundColor: "white",
          color: "#CD2500",
        }
      );
      this.textObject.setScrollFactor(0);
      scene.uiElements.push(this.textObject);

      this.objectInfoText = scene.add.text(
        25,
        60,
        `Selected Object: ${this.getObjectName()}`,
        {
          fontFamily: "Roboto, Helvetica, comic sans, serif",
          fontSize: "24px",
          backgroundColor: "white",
          color: "#CD2500",
        }
      );
      this.objectInfoText.setScrollFactor(0);
      scene.uiElements.push(this.objectInfoText);
    }
  }

  getObjectSelect(): number {
    return Math.floor(this.fineObjectSelect);
  }

  getObjectName(): string {
    return this.level.getAssetKeys()[this.getObjectSelect()];
  }

  customLogic(level: LevelEditor): void {
    const playerBody = level.editor.body as Phaser.Physics.Arcade.Body;

    // PLAYER CONTROLS
    const inputManager = level.input as Phaser.Input.InputPlugin;
    const keyboard =
      inputManager.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    let cursors = keyboard.createCursorKeys();

    // LEFT AND RIGHT
    if (cursors.left.isDown || level.keyA.isDown) {
      playerBody.setVelocityX(this.speed * -1);
    } else if (cursors.right.isDown || level.keyD.isDown) {
      playerBody.setVelocityX(this.speed * 1);
    } else {
      playerBody.setVelocityX(0);
    }

    // UP AND DOWN
    if (cursors.up.isDown || level.keyW.isDown) {
      playerBody.setVelocityY(this.speed * -1);
    } else if (cursors.down.isDown || level.keyS.isDown) {
      playerBody.setVelocityY(this.speed * 1);
    } else {
      playerBody.setVelocityY(0);
    }

    // Object Selection
    let selectPan = 0.1;
    if (level.keyQ.isDown) {
      this.fineObjectSelect -= selectPan;
    }

    if (level.keyE.isDown) {
      this.fineObjectSelect += selectPan;
      if (this.fineObjectSelect < 0) {
        this.fineObjectSelect = 0;
      }
    }

    // Flash Selected Object
    let keys = level.getAssetKeys();
    if (this.fineObjectSelect > keys.length - 1) {
      this.fineObjectSelect = 0;
    }
    if (new Date().getSeconds() % 2 == 0) {
      level.editor.setTexture("editor");
    } else {
      level.editor.setTexture(level.getAssetKeys()[this.getObjectSelect()]);
    }

    // PLACE OBJECTS
    if (level.keySpace.isDown && level.editor.canFire) {
      let bullet = level.bullets
        .create(level.editor.x, level.editor.y, "playerbullet")
        .setScale(0.25);
      bullet.setBounce(0.0);
      bullet.setCollideWorldBounds(true);
      bullet.setAngle(level.editor.angle);
      bullet.velocity = level.physics.velocityFromAngle(
        level.editor.angle,
        700
      );
      bullet.body.setVelocity(
        playerBody.velocity.x + bullet.velocity.x,
        playerBody.velocity.y + bullet.velocity.y
      );
      level.editor.canFire = false;
      level.time.addEvent({
        delay: 500,
        callback: () => {
          level.editor.canFire = true;
        },
      });
      level.time.addEvent({
        delay: 1500,
        callback: () => {
          bullet.destroy();
        },
      });
    }

    if (this.debug) {
      this.textObject.text = `Editor Position: ${Math.floor(
        this.x
      )},${Math.floor(this.y)}`;
      this.objectInfoText.text = `Selected Object: ${this.getObjectName()}`;
    }
  }
}
