import { Level1 } from "../Levels/Level1.ts";
import { Level2 } from "../Levels/Level2.ts";

export class Player extends Phaser.Physics.Arcade.Sprite {
  speed: number = 3.5;
  turnRate: number = 4;
  canFire: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.07);
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);
    this.setDamping(true);
    this.setDrag(0.999);
    this.setMaxVelocity(450);
    this.setAngle(-90);
  }

  customLogic(level: Level1 | Level2): void {
    const playerBody = level.player.body as Phaser.Physics.Arcade.Body;

    // PLAYER CONTROLS
    const inputManager = level.input as Phaser.Input.InputPlugin;
    const keyboard =
      inputManager.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    let cursors = keyboard.createCursorKeys();

    // LEFT AND RIGHT
    if (cursors.left.isDown || level.keyA.isDown) {
      level.player.setAngle(level.player.angle - level.player.turnRate);
    } else if (cursors.right.isDown || level.keyD.isDown) {
      level.player.setAngle(level.player.angle + level.player.turnRate);
    }

    // UP AND DOWN
    if (cursors.up.isDown || level.keyW.isDown) {
      let angleInDegrees = level.player.angle; // Or set it based on input
      let velocity = level.physics.velocityFromAngle(
        angleInDegrees,
        level.player.speed
      );

      playerBody.setVelocity(
        playerBody.velocity.x + velocity.x,
        playerBody.velocity.y + velocity.y
      );
      level.emitter.emitting = true;
      level.player.setTexture("playerflame");
    } else {
      level.player.setTexture("player");
      level.emitter.emitting = false;
      level.player.setAcceleration(0); // needed
    }

    // SHOOTING
    if (level.keySpace.isDown && level.player.canFire) {
      let bullet = level.bullets
        .create(level.player.x, level.player.y, "playerbullet")
        .setScale(0.25);
      bullet.setBounce(0.0);
      bullet.setCollideWorldBounds(true);
      bullet.setAngle(level.player.angle);
      bullet.velocity = level.physics.velocityFromAngle(
        level.player.angle,
        700
      );
      bullet.body.setVelocity(
        playerBody.velocity.x + bullet.velocity.x,
        playerBody.velocity.y + bullet.velocity.y
      );
      level.player.canFire = false;
      level.time.addEvent({
        delay: 500,
        callback: () => {
          level.player.canFire = true;
        },
      });
      level.time.addEvent({
        delay: 1500,
        callback: () => {
          bullet.destroy();
        },
      });
    }
  }
}
