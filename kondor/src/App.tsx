import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import styles from "./App.module.css";

const App: React.FC = () => {
  const phaserGameRef: any = useRef(null);
  const gameInstanceRef: any = useRef(null);

  useEffect(() => {
    // Check if the Phaser script has loaded and if a game instance doesn't already exist
    if (window.Phaser && phaserGameRef.current && !gameInstanceRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: "phaser-game-container",
        width: "100%",
        height: "100%",
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
          },
        },
      };

      // load assets like images and sounds
      function preload() {
        this.load.image("star", "assets/bluestar.png");
      }

      let stars: Phaser.GameObjects.Image[] = [];
      // create is called once, after preload
      function create() {
        const mainCamera = this.cameras.main;
        const cameraWorldX = mainCamera.worldView.x;
        const cameraWorldY = mainCamera.worldView.y;
        // Get the camera's viewport dimensions
        const cameraViewWidth = mainCamera.width;
        const cameraViewHeight = mainCamera.height;

        const starsToAdd = 200;
        for (let i = 0; i < starsToAdd; i++) {
          const x = Phaser.Math.Between(0, cameraViewWidth);
          const y = Phaser.Math.Between(0, cameraViewHeight);
          let star = this.add.image(x, y, "star").setScale(0.05);
          stars.push(star);
        }
        /*
            this.add.image(400, 300, 'sky');

            const particles = this.add.particles(0, 0, 'red', {
                speed: 100,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            });

            const logo = this.physics.add.image(400, 100, 'logo');

            logo.setVelocity(100, 200);
            logo.setBounce(1, 1);
            logo.setCollideWorldBounds(true);

            particles.startFollow(logo);
            */
      }

      function update() {}

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
