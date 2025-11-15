export class InputHandler {
    keyDownListener = this.handleKeyDown.bind(this);

    constructor(game) {
        this.game = game;
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    handleKeyDown(event) {
        event.preventDefault();
        if (event.key === 'p' || event.key === 'P') {
            if (this.game.isPaused) {
                this.game.resumeGame();
            } else {
                this.game.pauseGame();
            }
        }

        if(this.game.isPaused || this.game.gameover) return;

        if (event.key === 'Shift') {
            this.game.handleHold();
        } else if (event.key === ' ') { // Space key for hard drop
            this.game.handleHardDrop();
        } else if (event.key === 'ArrowLeft') {
            this.game.pieceMove(-1);
        } else if (event.key === 'ArrowRight') {
            this.game.pieceMove(1);
        } else if (event.key === 'ArrowDown') {
            this.game.pieceDrop();
        } else if (event.key === 'ArrowUp') {
            this.game.pieceRotate();
        }
    }

    handleVisibilityChange() {
        if (document.hidden && !this.game.gameover && !this.game.isPaused) {
            this.game.pauseGame();
        } 
    }
}
