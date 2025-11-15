import { Board, COLS, BLOCK_SIZE } from './Board.js';
import { Piece } from './Piece.js';

export class Game {
    constructor(context, canvasWidth, canvasHeight, previewContext, previewCanvasWidth, previewCanvasHeight, holdContext, holdCanvasWidth, holdCanvasHeight, scoreElement, levelElement, startButton, resumeButton, pauseOverlay) {
        this.board = new Board(context, canvasWidth, canvasHeight);
        this.previewBoard = new Board(previewContext, previewCanvasWidth, previewCanvasHeight);
        this.holdBoard = new Board(holdContext, holdCanvasWidth, holdCanvasHeight);

        this.scoreElement = scoreElement;
        this.levelElement = levelElement;
        this.startButton = startButton;
        this.resumeButton = resumeButton;
        this.pauseOverlay = pauseOverlay;

        this.score = 0;
        this.level = 1;
        this.rowsCleared = 0;
        this.gameover = false;
        this.isPaused = false;
        this.animationFrameId = null;

        this.piece = null;
        this.pieceBag = [];
        this.nextPiece = null;
        this.heldPiece = null;

        this.dropCounter = 0;
        this.lastTime = 0;

        this.initEventListeners();
    }

    initEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.resumeButton.addEventListener('click', () => this.resumeGame());
    }

    fillBag() {
        this.pieceBag = [0, 1, 2, 3, 4, 5, 6];
        for (let i = this.pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.pieceBag[i], this.pieceBag[j]] = [this.pieceBag[j], this.pieceBag[i]];
        }
    }

    prepareNextPiece() {
        if (this.pieceBag.length === 0) {
            this.fillBag();
        }

        if (this.nextPiece) {
            this.piece = this.nextPiece;
        } else {
            const pieceIndex = this.pieceBag.pop();
            this.piece = new Piece(pieceIndex);

            if (this.pieceBag.length === 0) {
                this.fillBag();
            }
        }

        this.piece.pos.y = 0;
        this.piece.pos.x = (COLS / 2 | 0) - (this.piece.matrix[0].length / 2 | 0);
        
        const nextPieceIndex = this.pieceBag.pop();
        this.nextPiece = new Piece(nextPieceIndex);

        if (this.board.collide(this.piece)) {
            this.gameover = true;
            alert('Game Over! Your score: ' + this.score);
            this.board.board.forEach(row => row.fill(0));
        }
    }

    draw() {
        this.board.drawBoard();

        if (this.piece) {
            const ghostY = this.piece.getGhostY(this.board);
            this.board.drawMatrix(this.piece.matrix, { x: this.piece.pos.x, y: ghostY }, 0.3);
            this.board.drawMatrix(this.piece.matrix, this.piece.pos);
        }

        this.drawPreview();
        this.drawHold();
    }

    drawPreview() {
        this.previewBoard.drawBoard();
        if (this.nextPiece) {
            const x = (this.previewBoard.canvasWidth / BLOCK_SIZE / 2) - (this.nextPiece.matrix[0].length / 2);
            const y = (this.previewBoard.canvasHeight / BLOCK_SIZE / 2) - (this.nextPiece.matrix.length / 2);
            this.previewBoard.drawMatrix(this.nextPiece.matrix, { x, y });
        }
    }

    drawHold() {
        this.holdBoard.drawBoard();
        if (this.heldPiece) {
            const x = (this.holdBoard.canvasWidth / BLOCK_SIZE / 2) - (this.heldPiece.matrix[0].length / 2);
            const y = (this.holdBoard.canvasHeight / BLOCK_SIZE / 2) - (this.heldPiece.matrix.length / 2);
            this.holdBoard.drawMatrix(this.heldPiece.matrix, { x, y });
        }
    }
    
    handleHold() {
        if (this.heldPiece) {
            [this.piece, this.heldPiece] = [this.heldPiece, this.piece];
        } else {
            this.heldPiece = this.piece;
            this.prepareNextPiece();
        }
        
        this.draw();
    }

    handleHardDrop() {
        while (!this.board.collide(this.piece)) {
            this.piece.pos.y++;
        }
        this.piece.pos.y--;
        this.board.merge(this.piece.matrix, this.piece.pos);
        this.prepareNextPiece();
        this.sweep();
        this.draw();
    }

    pieceMove(dir) {
        this.piece.pos.x += dir;
        if (this.board.collide(this.piece)) {
            this.piece.pos.x -= dir;
        }
        this.draw();
    }

    pieceDrop() {
        this.piece.pos.y++;
        if (this.board.collide(this.piece)) {
            this.piece.pos.y--;
            this.board.merge(this.piece.matrix, this.piece.pos);
            this.prepareNextPiece();
            this.sweep();
        }
        this.dropCounter = 0;
        this.draw();
    }

    pieceRotate() {
        const pos = this.piece.pos.x;
        let offset = 1;
        this.piece.rotate();
        while (this.board.collide(this.piece)) {
            this.piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.piece.matrix[0].length) {
                this.piece.rotate();
                this.piece.pos.x = pos;
                return;
            }
        }
        this.draw();
    }

    sweep() {
        let cleared = 0;
        outer: for (let y = this.board.board.length - 1; y > 0; --y) {
            for (let x = 0; x < this.board.board[y].length; ++x) {
                if (this.board.board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.board.board.splice(y, 1)[0].fill(0);
            this.board.board.unshift(row);
            ++y;
            cleared++;
        }
        if (cleared > 0) {
            this.score += (cleared * 10) * this.level;
            this.rowsCleared += cleared;
            if (this.rowsCleared >= 10) {
                this.level++;
                this.rowsCleared = 0;
                this.dropInterval = Math.floor(this.dropInterval * .845);
            }
            this.updateScore();
        }
    }

    updateScore() {
        this.scoreElement.innerText = this.score;
        this.levelElement.innerText = this.level;
    }

    update(time = 0) {
        if (this.gameover || this.isPaused) {
            return;
        }
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.pieceDrop();
        }
        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    }

    pauseGame() {
        this.isPaused = true;
        this.pauseOverlay.style.display = 'flex';
        cancelAnimationFrame(this.animationFrameId);
    }

    resumeGame() {
        this.isPaused = false;
        this.pauseOverlay.style.display = 'none';
        this.update();
    }

    startGame() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.rowsCleared = 0;
        this.gameover = false;
        this.isPaused = false;
        this.dropInterval = 800;

        this.fillBag();
        this.prepareNextPiece();
        this.heldPiece = null;

        this.updateScore();
        this.draw();
        this.update();
    }
}
