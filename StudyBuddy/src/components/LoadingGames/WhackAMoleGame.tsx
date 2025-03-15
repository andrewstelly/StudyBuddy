import React, { useEffect, useRef, useState } from 'react';
import './WhackAMoleGame.css'; // Import the CSS file for styling

const SCREEN_WIDTH = 300;
const SCREEN_HEIGHT = 300;

const WhackAMoleGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const holeImageRef = useRef<HTMLImageElement>(null);
  const moleImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    // Load images
    const holeImage = new Image();
    holeImage.src = '../Images/hole.png'; // Replace with the path to your hole image
    holeImageRef.current = holeImage;

    const moleImage = new Image();
    moleImage.src = '../Images/StudyBuddyLogo.png'; // Path to the mole image
    moleImageRef.current = moleImage;

    // Ensure images are loaded before starting the game
    let imagesLoaded = 0;
    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        startGame();
      }
    };

    holeImage.onload = onImageLoad;
    moleImage.onload = onImageLoad;

    // Game constants and variables
    const GRID_SIZE = 3;
    const CELL_SIZE = 90;
    const MOLE_SIZE = 70;
    const GRID_SPACING = 10;
    const BACKGROUND_COLOR = '#008000';
    const FPS = 30;
    const MOLE_TIME = 1000; // in milliseconds
    const GAME_TIME = 1200000; // in milliseconds

    let playerScore = 0;
    let molePosition = { row: 0, col: 0 };
    let moleVisible = false;
    let lastMoleTime = 0;
    let startTime = Date.now();

    const drawGrid = () => {
      context.fillStyle = BACKGROUND_COLOR;
      context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      const offsetX = (SCREEN_WIDTH - (GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GRID_SPACING)) / 2;
      const offsetY = (SCREEN_HEIGHT - (GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GRID_SPACING)) / 2;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const x = offsetX + col * (CELL_SIZE + GRID_SPACING);
          const y = offsetY + row * (CELL_SIZE + GRID_SPACING);
          context.drawImage(holeImageRef.current!, x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    };

    const drawMole = () => {
      if (!moleVisible) return;
      const offsetX = (SCREEN_WIDTH - (GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GRID_SPACING)) / 2;
      const offsetY = (SCREEN_HEIGHT - (GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GRID_SPACING)) / 2;
      const x = offsetX + molePosition.col * (CELL_SIZE + GRID_SPACING) + (CELL_SIZE - MOLE_SIZE) / 2;
      const y = offsetY + molePosition.row * (CELL_SIZE + GRID_SPACING) + (CELL_SIZE - MOLE_SIZE) / 2;
      context.drawImage(moleImageRef.current!, x, y, MOLE_SIZE, MOLE_SIZE);
    };

    const updateGame = () => {
      const currentTime = Date.now();
      if (currentTime - lastMoleTime > MOLE_TIME) {
        moleVisible = false;
      }
      if (!moleVisible && currentTime - lastMoleTime > MOLE_TIME) {
        molePosition = {
          row: Math.floor(Math.random() * GRID_SIZE),
          col: Math.floor(Math.random() * GRID_SIZE),
        };
        moleVisible = true;
        lastMoleTime = currentTime;
      }
    };

    const gameLoop = () => {
      drawGrid();
      drawMole();
      updateGame();
      requestAnimationFrame(gameLoop);
    };

    const handleMouseClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / (CELL_SIZE + GRID_SPACING));
      const row = Math.floor(y / (CELL_SIZE + GRID_SPACING));
      if (row === molePosition.row && col === molePosition.col) {
        if (moleVisible) {
          playerScore++;
          moleVisible = false;
        } else {
          playerScore--;
        }
      } else {
        playerScore--;
      }
      setScore(playerScore);
      console.log('Score:', playerScore);
    };

    const startGame = () => {
      canvas.addEventListener('click', handleMouseClick);
      gameLoop();
    };

    return () => {
      canvas.removeEventListener('click', handleMouseClick);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="processing-text">Processing...</div>
      <canvas ref={canvasRef} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
      <div className="score-display">Score: {score}</div>
    </div>
  );
};

export default WhackAMoleGame;