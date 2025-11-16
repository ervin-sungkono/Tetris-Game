import { Game } from './Game.js';
import { InputHandler } from './InputHandler.js';
import { BLOCK_SIZE, COLS, ROWS } from './Board.js';

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const previewCanvas = document.getElementById('preview');
const previewContext = previewCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const holdContext = holdCanvas.getContext('2d');

// Set canvas dimensions based on BLOCK_SIZE and game constants
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
previewCanvas.width = 5 * BLOCK_SIZE; 
previewCanvas.height = 5 * BLOCK_SIZE;
holdCanvas.width = 5 * BLOCK_SIZE;
holdCanvas.height = 5 * BLOCK_SIZE;

// Scale contexts
context.scale(BLOCK_SIZE, BLOCK_SIZE);
previewContext.scale(BLOCK_SIZE, BLOCK_SIZE);
holdContext.scale(BLOCK_SIZE, BLOCK_SIZE);

const game = new Game(context, previewContext, holdContext);

new InputHandler(game);

// Initial draw and setup
game.startGame(); // This will also call draw and updateScore
