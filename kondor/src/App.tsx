import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import styles from "./App.module.css";
import { getLevel1 } from "./Levels/Level1.ts";

const App: React.FC = () => {
  const phaserGameRef: any = useRef(null);
  const gameInstanceRef: any = useRef(null);

  useEffect(() => {
    const allLevels: any = [getLevel1()];
    let levelIndex = 0;

    // Check if the Phaser script has loaded and if a game instance doesn't already exist
    if (window.Phaser && phaserGameRef.current && !gameInstanceRef.current) {
      const config = allLevels[levelIndex].getConfig();
      //console.log(JSON.stringify(config));
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
