import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import styles from "./App.module.css";

const App: React.FC = () => {
  const phaserGameRef: any = useRef(null);
  const gameInstanceRef: any = useRef(null);
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

  useEffect(() => {
    // Check if the Phaser script has loaded and if a game instance doesn't already exist
    if (window.Phaser && phaserGameRef.current && !gameInstanceRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: "phaser-game-container",
        //width: "100%",
        //height: "100%",
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
      };

      let player;
      // load assets like images and sounds
      function preload() {
        this.load.image("star", "assets/bluestar.png");
        //this.load.image("player", "assets/planes_08A.png");
        this.load.spritesheet("player", "assets/planes_08A.png", {
          frameWidth: 96,
          frameHeight: 96,
          endFrame: 19,
        });
      }

      let staticStars: Phaser.GameObjects.Image[] = [];
      let movingStars1: Phaser.GameObjects.Image[] = [];
      let movingStars2: Phaser.GameObjects.Image[] = [];

      // create is called once, after preload
      function create() {
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
          const x = Phaser.Math.Between(
            0 - cameraViewWidth * 2,
            cameraViewWidth * 3
          );
          const y = Phaser.Math.Between(0, cameraViewHeight + cameraOffsetY);
          let star = this.add.image(x, y, "star").setScale(0.05);
          staticStars.push(star);
        }
        for (let i = 0; i < movingStarsToAdd1; i++) {
          const x = Phaser.Math.Between(
            0 - cameraViewWidth * 2,
            cameraViewWidth * 3
          );
          const y = Phaser.Math.Between(0, cameraViewHeight + cameraOffsetY);
          let star = this.add.image(x, y, "star").setScale(0.05);
          movingStars1.push(star);
        }
        for (let i = 0; i < movingStarsToAdd2; i++) {
          const x = Phaser.Math.Between(
            0 - cameraViewWidth * 2,
            cameraViewWidth * 3
          );
          const y = Phaser.Math.Between(0, cameraViewHeight + cameraOffsetY);
          let star = this.add.image(x, y, "star").setScale(0.05);
          movingStars2.push(star);
        }
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
            star.setPosition(
              star.x,
              star.y - this.cameras.main.worldView.height
            );
          }
        });
        movingStars1.forEach((star: Phaser.GameObjects.Image) => {
          star.setPosition(star.x, star.y - starSpeed1);
        });
        movingStars2.forEach((star: Phaser.GameObjects.Image) => {
          star.setPosition(star.x, star.y - starSpeed2);
        });
      }

      // Create the new Phaser game instance
      gameInstanceRef.current = new Phaser.Game(config);
    }

    // --- CLEANUP LOGIC ---
    // This function will be called when the component unmounts
    return () => {
      if (gameInstanceRef.current) {
        // Destroy the game instance
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []); // run once

  return (
    <>
      <div className={styles.blackBackground}>
        <div className={`${styles.sovietFont} ${styles.centerText}`}>
          IKS KONDOR
        </div>
        <div
          id={`phaser-game-container`}
          ref={phaserGameRef}
          className={styles.gameWindow}
        />
      </div>
    </>
  );
};

export default App;
