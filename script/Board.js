import { colors } from "./Piece.js";

export const ROWS = 18;
export const COLS = 10;
export const BLOCK_SIZE = 20;

export class Board {
    constructor(context) {
        this.context = context;
        this.canvasWidth = context.canvas.width;
        this.canvasHeight = context.canvas.height;
        this.board = this.createBoard();
    }

    createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    drawMatrix(matrix, offset, alpha = 1) {
        this.context.globalAlpha = alpha;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = colors[value];
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
        this.context.globalAlpha = 1; // Reset transparency
    }

    drawBoard() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.drawMatrix(this.board, { x: 0, y: 0 });
    }

    merge(playerMatrix, playerPos) {
        playerMatrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board[y + playerPos.y][x + playerPos.x] = value;
                }
            });
        });
    }

    collide(player) {
        const { matrix, pos } = player;
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < matrix[y].length; ++x) {
                if (matrix[y][x] !== 0 && (this.board[y + pos.y] && this.board[y + pos.y][x + pos.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    clearLines() {
        let cleared = 0;
        outer: for (let y = this.board.length - 1; y > 0; --y) {
            for (let x = 0; x < this.board[y].length; ++x) {
                if (this.board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.board.splice(y, 1)[0].fill(0);
            this.board.unshift(row);
            ++y;
            cleared++;
        }
        return cleared;
    }

    reset() {
        this.board = this.createBoard();
    }
}
