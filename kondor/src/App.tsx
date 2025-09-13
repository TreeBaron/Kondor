import React from 'react';
import styles from './App.module.css';

const App: React.FC = () => {
  return (
    <div className={styles.blackBackground}>
      <div className={`${styles.sovietFont} ${styles.centerText}`}>
        IKS KONDOR
      </div>
      <div className={styles.gameWindow}>
        game window here
      </div>
    </div>
  );
}

export default App;
