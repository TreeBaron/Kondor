import { CustomLevel } from "../Levels/CustomLevel.ts";

export class Player extends Phaser.Physics.Arcade.Sprite {
  speed: number = 3.5;
  turnRate: number = 4;
  canFire: boolean = true;
  textObject!: Phaser.GameObjects.Text;
  debug: boolean = true;
  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: CustomLevel, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.5);
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);
    this.setDamping(true);
    this.setDrag(0.999);
    this.setMaxVelocity(450);
    this.setAngle(-90);

    // Setup debug stuff
    if (this.debug) {
      this.textObject = scene.add.text(
        25,
        25,
        `Player Position: ${Math.floor(x)},${Math.floor(y)}`,
        {
          fontFamily: "Roboto, Helvetica, comic sans, serif",
          fontSize: "24px",
          backgroundColor: "white",
          color: "#CD2500",
        }
      );
      this.textObject.setScrollFactor(0);
      scene.uiElements.push(this.textObject);
    }

    // PLAYER SMOKE EMITTER
    this.emitter = scene.add.particles(0, 0, "star", {
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
        this.angle + angleOffset + Phaser.Math.Between(-7, 7); // Or set it based on input
      let velocity = scene.physics.velocityFromAngle(
        angleInDegrees,
        this.speed * 500
      );
      particle.velocityX = velocity.x; //+ Phaser.Math.Between(-200, 200);
      particle.velocityY = velocity.y; // + Phaser.Math.Between(-200, 200);
    });
    this.emitter.startFollow(this);
  }

  customLogic(level: CustomLevel): void {
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
      this.emitter.emitting = true;
      level.player.setTexture("playerflame");
    } else {
      level.player.setTexture("player");
      this.emitter.emitting = false;
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

    if (this.debug) {
      this.textObject.text = `Player Position: ${Math.floor(
        this.x
      )},${Math.floor(this.y)}`;
    }
  }
}
