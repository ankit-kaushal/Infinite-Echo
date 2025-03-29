'use client'

import { useEffect } from 'react'
import { useGame } from './providers/GameProvider'
import GameCanvas from './GameCanvas'
import GameOverlay from './GameOverlay'
import styles from './Game.module.css'

const PLAYER_SPEED = 5

export default function Game() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault() // Prevent scrolling from arrow keys
      
      if (!state.isPlaying) {
        if (e.code === 'Space') {
          dispatch({ type: 'START_GAME' })
        }
        return
      }

      const velocity = { ...state.velocity }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          velocity.y = -PLAYER_SPEED
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          velocity.y = PLAYER_SPEED
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          velocity.x = -PLAYER_SPEED
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          velocity.x = PLAYER_SPEED
          break
      }

      dispatch({ type: 'SET_VELOCITY', payload: velocity })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault() // Prevent scrolling from arrow keys
      if (!state.isPlaying) return

      const velocity = { ...state.velocity }

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'w':
        case 'W':
        case 's':
        case 'S':
          velocity.y = 0
          break
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'A':
        case 'd':
        case 'D':
          velocity.x = 0
          break
      }

      dispatch({ type: 'SET_VELOCITY', payload: velocity })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [state.isPlaying])

  // Update position based on velocity
  useEffect(() => {
    if (!state.isPlaying) return

    const gameLoop = () => {
      const newPosition = {
        x: state.currentPosition.x + state.velocity.x,
        y: state.currentPosition.y + state.velocity.y
      }
      dispatch({ type: 'UPDATE_POSITION', payload: newPosition })
    }

    const interval = setInterval(gameLoop, 16) // ~60fps
    return () => clearInterval(interval)
  }, [state.isPlaying, state.velocity, state.currentPosition])

  return (
    <div className={styles.container}>
      <GameCanvas />
      <GameOverlay />
    </div>
  )
}