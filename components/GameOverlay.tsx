'use client'

import { useGame } from './providers/GameProvider'
import Link from 'next/link'
import styles from './GameOverlay.module.css'

export default function GameOverlay() {
  const { state } = useGame()

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.loopText}>Loop {state.currentLoop}</div>
        <div className={styles.timeText}>
          {Math.ceil(state.timeRemaining)}s
        </div>
      </div>

      <Link
        href="/"
        className={styles.exitButton}
      >
        Exit Game
      </Link>
    </div>
  )
}