'use client'

import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Infinite Echo</h1>
      
      <div className={styles.card}>
        <h2 className={styles.subtitle}>How to Play</h2>
        
        <div className={styles.sectionContainer}>
          <section>
            <h3 className={styles.sectionTitle}>🎮 Controls</h3>
            <ul className={styles.list}>
              <li>WASD or Arrow Keys to move</li>
              <li>Press ESC for in-game instructions</li>
            </ul>
          </section>

          <section>
            <h3 className={styles.sectionTitle}>⏰ Time Loop Mechanic</h3>
            <ul className={styles.list}>
              <li>Every 30 seconds, time resets</li>
              <li>Your past actions become cyan echoes</li>
              <li>Avoid colliding with past echoes</li>
            </ul>
          </section>

          <section>
            <h3 className={styles.sectionTitle}>🎯 Objectives</h3>
            <ul className={styles.list}>
              <li>Stand on red buttons to open blue doors</li>
              <li>Use your echoes to hold buttons while you move</li>
              <li>Reach the green goal to complete levels</li>
            </ul>
          </section>
        </div>

        <Link href="/game" className={styles.button}>
          Start Game
        </Link>
      </div>
    </div>
  )
}
