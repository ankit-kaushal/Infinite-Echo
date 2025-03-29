export interface Wall {
  x: number
  y: number
  width: number
  height: number
}

export interface Button {
  x: number
  y: number
  radius: number
  isPressed: boolean
  doorId: number
}

export interface Door {
  id: number
  x: number
  y: number
  width: number
  height: number
  isOpen: boolean
}

export interface Goal {
  x: number
  y: number
  radius: number
}

export const level1 = {
  walls: [
    { x: 100, y: 100, width: 20, height: 400 },
    { x: 100, y: 100, width: 600, height: 20 },
    { x: 700, y: 100, width: 20, height: 400 },
    { x: 100, y: 500, width: 620, height: 20 },
    { x: 300, y: 100, width: 20, height: 300 },
  ],
  buttons: [
    { x: 200, y: 200, radius: 20, isPressed: false, doorId: 1 }
  ],
  doors: [
    { id: 1, x: 300, y: 400, width: 20, height: 100, isOpen: false }
  ],
  goal: { x: 600, y: 400, radius: 30 },
  startPosition: { x: 150, y: 150 }
}