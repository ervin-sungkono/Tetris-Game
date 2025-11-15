import { Game } from './Game.js';
import { InputHandler } from './InputHandler.js';
import { BLOCK_SIZE, COLS, ROWS } from './Board.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('start-button');
    const previewCanvas = document.getElementById('preview');
    const previewContext = previewCanvas.getContext('2d');
    const holdCanvas = document.getElementById('hold');
    const holdContext = holdCanvas.getContext('2d');
    const pauseOverlay = document.getElementById('pause-overlay');
    const resumeButton = document.getElementById('resume-button');

    // Set canvas dimensions based on BLOCK_SIZE and game constants
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    previewCanvas.width = 4 * BLOCK_SIZE; // Assuming preview piece fits in 4x4
    previewCanvas.height = 4 * BLOCK_SIZE;
    holdCanvas.width = 4 * BLOCK_SIZE; // Assuming hold piece fits in 4x4
    holdCanvas.height = 4 * BLOCK_SIZE;

    // Scale contexts
    context.scale(BLOCK_SIZE, BLOCK_SIZE);
    previewContext.scale(BLOCK_SIZE, BLOCK_SIZE);
    holdContext.scale(BLOCK_SIZE, BLOCK_SIZE);

    const game = new Game(
        context, canvas.width, canvas.height,
        previewContext, previewCanvas.width, previewCanvas.height,
        holdContext, holdCanvas.width, holdCanvas.height,
        scoreElement, levelElement, startButton, resumeButton, pauseOverlay
    );

    new InputHandler(game);

    // Initial draw and setup
    game.startGame(); // This will also call draw and updateScore
});
