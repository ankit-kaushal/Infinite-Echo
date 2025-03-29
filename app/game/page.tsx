'use client'

import { GameProvider } from '@/components/providers/GameProvider'
import Game from '@/components/Game'

export default function GamePage() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}