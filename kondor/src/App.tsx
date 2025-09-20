import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import styles from "./App.module.css";
import { Level1 } from "./Levels/Level1.ts";

const App: React.FC = () => {
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!phaserGameRef.current && containerRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: "phaser-game-container",
        scene: [Level1],
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
        roundPixels: false,
        pixelArt: false,
        antialias: false,
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    // Cleanup when React component unmounts
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.blackBackground}>
      <div className={`${styles.sovietFont} ${styles.centerText}`}>
        KOLONY TRANSPORT INCORPORATED
      </div>
      <div
        id="phaser-game-container"
        ref={containerRef}
        className={styles.gameWindow}
      />
    </div>
  );
};

export default App;
