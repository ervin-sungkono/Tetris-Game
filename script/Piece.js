export const colors = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF', // Z
];

const pieces = [
    // T
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    // O
    [[2, 2], [2, 2]],
    // L
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    // J
    [[4, 0, 0], [4, 4, 4], [0, 0, 0]],
    // I
    [[0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0], [0, 0, 0, 0]],
    // S
    [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
    // Z
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
];

/**
 * @param {number} type - Type of piece ranging from 1 - 7
 * @param {object} pos - X and Y position of the piece
 */
export class Piece {
    constructor(type, pos = {}) {
        this.matrix = pieces[type];
        this.pos = { x: pos.x ?? 0, y: pos.y ?? 0 };
        this.color = colors[type + 1];
    }

    static fillBag() {
        const pieceBag = [0, 1, 2, 3, 4, 5, 6];
        for (let i = pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
        }
        return pieceBag;
    }

    rotate() {
        for (let y = 0; y < this.matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [this.matrix[x][y], this.matrix[y][x]] = [this.matrix[y][x], this.matrix[x][y]];
            }
        }
        // Reverse rows
        this.matrix.forEach(row => row.reverse());
    }

    move(dirX, dirY, boardInstance) {
        this.pos.x += dirX;
        this.pos.y += dirY;
        if (boardInstance.collide(this.matrix, this.pos)) {
            this.pos.x -= dirX;
            this.pos.y -= dirY;
            return false; // Collision occurred
        }
        return true; // Move succeeded
    }

    getGhostY(boardInstance) {
        const originalY = this.pos.y;
        this.pos.y++;
        while (!boardInstance.collide(this)) {
            this.pos.y++;
        }
        this.pos.y--; // Move back up one step to avoid collision
        const ghostY = this.pos.y;
        this.pos.y = originalY; // Reset player's Y position
        return ghostY;
    }
}
