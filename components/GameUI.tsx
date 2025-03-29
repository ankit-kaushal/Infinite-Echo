'use client'

import { useGame } from './providers/GameProvider'
import styles from './GameUI.module.css'

export default function GameUI() {
  const { state, dispatch } = useGame()

  return (
    <div className={styles.container}>
      <div className={styles.statsPanel}>
        <div className={styles.loopText}>Loop: {state.currentLoop}</div>
        <div className={styles.timeText}>Time: {state.timeRemaining}s</div>
      </div>
      
      {!state.isPlaying && (
        <button
          onClick={() => dispatch({ type: 'START_GAME' })}
          className={styles.startButton}
        >
          Start Game
        </button>
      )}
    </div>
  )
}