"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { level1 } from "@/components/levels/Level1";

interface Position {
  x: number;
  y: number;
}

interface MovementRecord {
  position: Position;
  timestamp: number;
}

interface GameState {
  currentLoop: number;
  timeRemaining: number;
  playerHistory: Position[][];
  isPlaying: boolean;
  currentPosition: Position;
  currentLevel: number;
  movementHistory: MovementRecord[][];
  velocity: Position;
  isMoving: boolean;
  showLevelComplete: boolean;
  persistentDoors: Set<string>;
  gameOver: boolean;
  gameOverMessage: string;
}

const initialState: GameState = {
  currentLoop: 1,
  timeRemaining: 30,
  playerHistory: [],
  isPlaying: false,
  currentPosition: level1.startPosition,
  currentLevel: 1,
  movementHistory: [],
  velocity: { x: 0, y: 0 },
  isMoving: false,
  showLevelComplete: false,
  persistentDoors: new Set(),
  gameOver: false,
  gameOverMessage: "",
};

type GameAction =
  | { type: "START_GAME" }
  | { type: "UPDATE_POSITION"; payload: Position }
  | { type: "STORE_HISTORY"; payload: Position[] }
  | { type: "NEW_LOOP" }
  | { type: "UPDATE_TIME"; payload: number }
  | { type: "SET_VELOCITY"; payload: Position }
  | { type: "RECORD_MOVEMENT"; payload: MovementRecord }
  | { type: "COMPLETE_LEVEL" }
  | { type: "ADD_PERSISTENT_DOOR"; payload: string }
  | { type: "GAME_OVER"; payload: string }
  | {
      type: "UPDATE_MOVEMENT";
      payload: { position: Position; velocity: Position };
    };

const GameContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<GameAction>;
    }
  | undefined
>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "NEW_LOOP":
      const generateValidPosition = () => {
        const minX = 100;
        const maxX = 700;
        const minY = 100;
        const maxY = 500;

        return {
          x: Math.random() * (maxX - minX) + minX,
          y: Math.random() * (maxY - minY) + minY,
        };
      };
      const newEchoes = Array.from({ length: 5 }, () =>
        generateValidPosition()
      );

      return {
        ...state,
        currentLoop: state.currentLoop + 1,
        timeRemaining: 30,
        currentPosition: level1.startPosition,
        echoPositions: newEchoes,
        isPlaying: true,
        velocity: { x: 0, y: 0 },
        isMoving: false,
      };

    case "GAME_OVER":
      return {
        ...state,
        isPlaying: false,
        gameOver: true,
        gameOverMessage: action.payload,
      };

    case "UPDATE_TIME":
      const newTime = action.payload;
      if (newTime <= 0 && state.isPlaying) {
        return {
          ...state,
          timeRemaining: newTime,
          isPlaying: true,
        };
      }
      return {
        ...state,
        timeRemaining: newTime,
      };

    case "START_GAME":
      return {
        ...state,
        isPlaying: true,
        timeRemaining: 30,
        currentLoop: 1,
        currentPosition: level1.startPosition,
        playerHistory: [],
        movementHistory: [],
        showLevelComplete: false,
        persistentDoors: new Set(),
        gameOver: false,
        gameOverMessage: "",
      };

    case "UPDATE_POSITION":
      return {
        ...state,
        currentPosition: action.payload,
        isMoving: true,
      };

    case "SET_VELOCITY":
      return {
        ...state,
        velocity: action.payload,
        isMoving: action.payload.x !== 0 || action.payload.y !== 0,
      };

    case "UPDATE_MOVEMENT":
      return {
        ...state,
        currentPosition: action.payload.position,
        velocity: action.payload.velocity,
        isMoving:
          action.payload.velocity.x !== 0 || action.payload.velocity.y !== 0,
      };

    case "SET_VELOCITY":
      return {
        ...state,
        velocity: action.payload,
        isMoving: action.payload.x !== 0 || action.payload.y !== 0,
      };

    case "UPDATE_POSITION":
      return {
        ...state,
        currentPosition: action.payload,
      };

    case "STORE_HISTORY":
      return {
        ...state,
        playerHistory: [...state.playerHistory, action.payload],
      };

    case "RECORD_MOVEMENT":
      const currentLoopHistory = [
        ...(state.movementHistory[state.currentLoop - 1] || []),
        action.payload,
      ];
      const newHistory = [...state.movementHistory];
      newHistory[state.currentLoop - 1] = currentLoopHistory;
      return {
        ...state,
        movementHistory: newHistory,
      };

    case "COMPLETE_LEVEL":
      return {
        ...state,
        showLevelComplete: true,
        isPlaying: false,
      };

    case "ADD_PERSISTENT_DOOR":
      const newDoors = new Set(state.persistentDoors);
      newDoors.add(action.payload);
      return {
        ...state,
        persistentDoors: newDoors,
      };

    case "GAME_OVER":
      return {
        ...state,
        isPlaying: false,
        gameOver: true,
        gameOverMessage: action.payload,
      };

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
