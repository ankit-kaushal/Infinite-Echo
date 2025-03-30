"use client";

import { useEffect, useRef } from "react";
import { useGame } from "./providers/GameProvider";
import { level1 } from "./levels/Level1";
import styles from "./GameCanvas.module.css";
import Toast from "./Toast";

const PLAYER_RADIUS = 15;

export default function GameCanvas() {
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastFrameTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const lastTimeUpdateRef = useRef(0);
  const isLoopTransitioningRef = useRef(false); // Move this here
  const gameStateRef = useRef({
    isLevelComplete: false,
    buttonStates: level1.buttons.map(() => false),
  });
  const { state, dispatch } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !state.isPlaying) {
        dispatch({ type: "START_GAME" });
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    function checkCollisions() {
      level1.buttons.forEach((button, index) => {
        const dx = state.currentPosition.x - button.x;
        const dy = state.currentPosition.y - button.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const wasPressed = gameStateRef.current.buttonStates[index];
        const isPressed = distance < button.radius + 15;

        if (isPressed) {
          if (!wasPressed) {
            gameStateRef.current.buttonStates[index] = true;
            level1.buttons[index].isPressed = true;
            level1.doors.find((door) => door.id === button.doorId)!.isOpen =
              true;
            dispatch({
              type: "ADD_PERSISTENT_DOOR",
              payload: button.doorId.toString(),
            });
          }
        }
      });

      // Check goal collision
      const dx = state.currentPosition.x - level1.goal.x;
      const dy = state.currentPosition.y - level1.goal.y;
      const distanceToGoal = Math.sqrt(dx * dx + dy * dy);

      if (
        distanceToGoal < level1.goal.radius + 15 &&
        !gameStateRef.current.isLevelComplete
      ) {
        gameStateRef.current.isLevelComplete = true;
        dispatch({ type: "COMPLETE_LEVEL" });
      }
    }

    function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
      ctx.fillStyle = "#00ff00";
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isPlaying || state.gameOver) return;
      const speed = 1;
      // Keep existing velocity for other direction to allow diagonal movement
      const newVelocity = { ...velocityRef.current };

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          newVelocity.y = -speed;
          break;
        case "ArrowDown":
        case "KeyS":
          newVelocity.y = speed;
          break;
        case "ArrowLeft":
        case "KeyA":
          newVelocity.x = -speed;
          break;
        case "ArrowRight":
        case "KeyD":
          newVelocity.x = speed;
          break;
      }

      velocityRef.current = newVelocity;
      dispatch({ type: "SET_VELOCITY", payload: newVelocity });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!state.isPlaying || state.gameOver) return;
      const newVelocity = { ...velocityRef.current };

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
        case "ArrowDown":
        case "KeyS":
          newVelocity.y = 0;
          break;
        case "ArrowLeft":
        case "KeyA":
        case "ArrowRight":
        case "KeyD":
          newVelocity.x = 0;
          break;
      }

      velocityRef.current = newVelocity;
      dispatch({ type: "SET_VELOCITY", payload: newVelocity });
    };

    // Update in gameLoop function
    function gameLoop(timestamp: number) {
      const deltaTime = 1 / 60;
      lastFrameTimeRef.current = timestamp;

      if (state.isPlaying && !state.gameOver) {
        // Check collision with echoes
        if (state.echoPositions && state.echoPositions.length > 0) {
          for (const echo of state.echoPositions) {
            const dx = state.currentPosition.x - echo.x;
            const dy = state.currentPosition.y - echo.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PLAYER_RADIUS * 2) {
              dispatch({
                type: "GAME_OVER",
                payload: "You collided with your echo!",
              });
              velocityRef.current = { x: 0, y: 0 };
              break;
            }
          }
        }

        if (velocityRef.current.x !== 0 || velocityRef.current.y !== 0) {
          const speed = 200;
          const newX =
            state.currentPosition.x + velocityRef.current.x * speed * deltaTime;
          const newY =
            state.currentPosition.y + velocityRef.current.y * speed * deltaTime;

          let isGameOver = false;
          let canMove = true;

          const playerRadius = 14;

          for (const wall of level1.walls) {
            if (
              newX - playerRadius < wall.x + wall.width &&
              newX + playerRadius > wall.x &&
              newY - playerRadius < wall.y + wall.height &&
              newY + playerRadius > wall.y
            ) {
              canMove = false;
              break;
            }
          }

          if (canMove) {
            for (const door of level1.doors) {
              if (
                !door.isOpen &&
                newX - playerRadius < door.x + door.width &&
                newX + playerRadius > door.x &&
                newY - playerRadius < door.y + door.height &&
                newY + playerRadius > door.y
              ) {
                canMove = false;
                isGameOver = true;
                break;
              }
            }
          }

          if (isGameOver) {
            dispatch({
              type: "GAME_OVER",
              payload: "You hit a wall or closed door!",
            });
            velocityRef.current = { x: 0, y: 0 };
          } else if (canMove) {
            dispatch({
              type: "UPDATE_POSITION",
              payload: { x: newX, y: newY },
            });
          }
        }

        // Timer logic
        if (startTimeRef.current === 0) {
          startTimeRef.current = timestamp;
          dispatch({
            type: "UPDATE_POSITION",
            payload: level1.startPosition,
          });
        }

        const elapsedTime = (timestamp - startTimeRef.current) / 1000;
        const remainingTime = Math.max(0, 30 - elapsedTime);
        const currentSecond = Math.floor(remainingTime);

        if (
          currentSecond !== lastTimeUpdateRef.current &&
          !isLoopTransitioningRef.current
        ) {
          lastTimeUpdateRef.current = currentSecond;

          if (currentSecond > 0) {
            dispatch({ type: "UPDATE_TIME", payload: currentSecond });

            if (!isLoopTransitioningRef.current) {
              dispatch({
                type: "RECORD_MOVEMENT",
                payload: {
                  position: state.currentPosition,
                  timestamp: Date.now(),
                },
              });
            }
          } else if (currentSecond === 0 && state.timeRemaining > 0) {
            isLoopTransitioningRef.current = true;
            dispatch({ type: "NEW_LOOP" });
            startTimeRef.current = timestamp;
            lastTimeUpdateRef.current = 30;
            setTimeout(() => {
              isLoopTransitioningRef.current = false;
            }, 100);
          }
        }
      }

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // Draw echoes
      if (state.echoPositions && state.echoPositions.length > 0) {
        ctx.fillStyle = "#87CEEB";
        ctx.shadowColor = "#87CEEB";
        ctx.shadowBlur = 15;
        state.echoPositions.forEach((echo) => {
          ctx.beginPath();
          ctx.arc(echo.x, echo.y, PLAYER_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      // Draw walls
      ctx.fillStyle = "#444";
      level1.walls.forEach((wall) => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      });

      // Draw buttons
      level1.buttons.forEach((button) => {
        ctx.beginPath();
        ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
        ctx.fillStyle = button.isPressed ? "#ff0" : "#f00";
        ctx.fill();
      });

      // Draw doors
      level1.doors.forEach((door) => {
        if (!door.isOpen) {
          ctx.fillStyle = "#00f";
          ctx.fillRect(door.x, door.y, door.width, door.height);
        }
      });

      // Draw goal
      ctx.beginPath();
      ctx.arc(level1.goal.x, level1.goal.y, level1.goal.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0f0";
      ctx.fill();

      // Draw current player
      drawPlayer(ctx, state.currentPosition.x, state.currentPosition.y);

      // Check collisions
      checkCollisions();
      requestAnimationFrame(gameLoop);
    } // Add missing closing brace here

    const animationFrame = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    state.currentPosition,
    state.isPlaying,
    state.currentLoop,
    state.timeRemaining,
  ]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} />
      {state.showLevelComplete && <Toast message="Level Complete!" />}
      {state.gameOver && <Toast message={state.gameOverMessage} />}
    </>
  );
}
