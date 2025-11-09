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

    const ROWS = 18;
    const COLS = 10;
    const BLOCK_SIZE = 20;

    context.scale(BLOCK_SIZE, BLOCK_SIZE);
    previewContext.scale(BLOCK_SIZE, BLOCK_SIZE);
    holdContext.scale(BLOCK_SIZE, BLOCK_SIZE);

    let board = createBoard();
    let score = 0;
    let level = 1;
    let rowsCleared = 0;
    let gameover = false;

    const colors = [
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

    let player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        color: null,
    };

    let pieceBag = [];
    let nextPiece = null;
    let heldPiece = null;

    function fillBag() {
        pieceBag = [0, 1, 2, 3, 4, 5, 6];
        for (let i = pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
        }
    }

    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function prepareNextPlayerAndPreviewPieces() {
        if (pieceBag.length === 0) {
            fillBag();
        }
        // Get the next piece for the player
        const pieceIndex = pieceBag.pop();
        player.matrix = pieces[pieceIndex];
        player.color = colors[pieceIndex + 1];

        // Get the subsequent piece for the preview
        if (pieceBag.length === 0) {
            fillBag();
        }
        const nextPieceIndex = pieceBag.pop();
        nextPiece = {
            matrix: pieces[nextPieceIndex],
            color: colors[nextPieceIndex + 1],
        };

        // Reset player position
        player.pos.y = 0;
        player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

        // Check for game over condition
        if (collide(player, board)) {
            gameover = true;
            alert('Game Over! Your score: ' + score);
            // Reset board
            board.forEach(row => row.fill(0));
        }
    }

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(board, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
        drawPreview();
        drawHold();
    }

    function drawMatrix(matrix, offset, ctx = context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = colors[value];
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function drawPreview() {
        previewContext.fillStyle = '#000';
        previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        if (nextPiece) {
            const x = (previewCanvas.width / BLOCK_SIZE / 2) - (nextPiece.matrix[0].length / 2);
            const y = (previewCanvas.height / BLOCK_SIZE / 2) - (nextPiece.matrix.length / 2);
            drawMatrix(nextPiece.matrix, { x, y }, previewContext);
        }
    }

    function drawHold() {
        holdContext.fillStyle = '#000';
        holdContext.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
        if (heldPiece) {
            const x = (holdCanvas.width / BLOCK_SIZE / 2) - (heldPiece.matrix[0].length / 2);
            const y = (holdCanvas.height / BLOCK_SIZE / 2) - (heldPiece.matrix.length / 2);
            drawMatrix(heldPiece.matrix, { x, y }, holdContext);
        }
    }

    function merge(player, board) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function collide(player, board) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function playerReset() {
        // This function is called when a piece lands and needs to be replaced by the next piece from the bag.

        if (pieceBag.length === 0) {
            fillBag();
        }
        const pieceIndex = pieceBag.pop(); // Get the next piece from the bag
        player.matrix = pieces[pieceIndex];
        player.color = colors[pieceIndex + 1];

        player.pos.y = 0;
        player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

        // Game over check is handled here as well, as a new piece might immediately collide.
        if (collide(player, board)) {
            gameover = true;
            alert('Game Over! Your score: ' + score);
            // Reset board
            board.forEach(row => row.fill(0));
        }
    }

    function handleHold() {
        if (heldPiece) { // If there's a piece in the hold box
            // Swap current player piece with held piece
            [player.matrix, heldPiece.matrix] = [heldPiece.matrix, player.matrix];
            [player.color, heldPiece.color] = [heldPiece.color, player.color];
        } else { // If hold box is empty
            // Store current player piece into hold box
            heldPiece = {
                matrix: player.matrix,
                color: player.color,
            };

            prepareNextPlayerAndPreviewPieces(); // Prepare the next player and preview pieces
        }

        draw(); // Redraw everything to show the changes (including the hold box and the new player piece)
    }

    function handleHardDrop() {
        while (!collide(player, board)) {
            player.pos.y++;
        }
        player.pos.y--; // Move back up one step to avoid collision
        merge(player, board);
        playerReset();
        sweep();
        draw();
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(player, board)) {
            player.pos.x -= dir;
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(player, board)) {
            player.pos.y--;
            merge(player, board);
            playerReset();
            sweep();
        }
        dropCounter = 0;
    }

    function playerRotate() {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix);
        while (collide(player, board)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix); // Rotate back
                player.pos.x = pos;
                return;
            }
        }
    }

    function rotate(matrix) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        matrix.forEach(row => row.reverse());
    }

    function sweep() {
        let cleared = 0;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;
            cleared++;
        }
        if (cleared > 0) {
            score += (cleared * 10) * level;
            rowsCleared += cleared;
            if (rowsCleared >= 10) {
                level++;
                rowsCleared = 0;
                dropInterval /= 1.5;
            }
            updateScore();
        }
    }

    function updateScore() {
        scoreElement.innerText = score;
        levelElement.innerText = level;
    }

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    function update(time = 0) {
        if (gameover) {
            return;
        }
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }

    document.addEventListener('keydown', event => {
        event.preventDefault();
        if (event.key === 'Shift') {
            handleHold();
        } else if (event.key === ' ') { // Space key for hard drop
            handleHardDrop();
        } else if (event.key === 'ArrowLeft') {
            playerMove(-1);
        } else if (event.key === 'ArrowRight') {
            playerMove(1);
        } else if (event.key === 'ArrowDown') {
            playerDrop();
        } else if (event.key === 'ArrowUp') {
            playerRotate();
        }
    });

    function startGame() {
        board = createBoard();
        score = 0;
        level = 1;
        rowsCleared = 0;
        gameover = false;
        dropInterval = 1000;

        fillBag(); // Fill the bag with 7 pieces

        // Prepare the first player piece and the next preview piece
        prepareNextPlayerAndPreviewPieces();

        heldPiece = null; // Initialize heldPiece

        updateScore();
        draw(); // Draw initial state
        requestAnimationFrame(update); // Start the game loop
    }

    startButton.addEventListener('click', startGame);
});
