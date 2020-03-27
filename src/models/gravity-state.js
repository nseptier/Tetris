import DIRECTION from 'enums/direction';
import KEY from 'enums/key';
import NewGameState from 'models/new-game-state';
import PausedState from 'models/paused-state';
import RowsClearingState from 'models/rows-clearing-state';
import STATE from 'enums/state';

const FRAME_LENGTH_AT_60_FPS = 1000 / 60;
const LOCK_DELAY = 500;

export default class GravityState {
  constructor({ game, lastUpdatedAt, lockExpiry, movesLeft, startedAt }) {
    this.game = game;
    this.lastUpdatedAt = lastUpdatedAt || 0;
    this.lockExpiry = lockExpiry || 0;
    this.movesLeft = movesLeft || 0;
    this.name = STATE.GRAVITY;
    this.startedAt = startedAt || 0;
  }

  applyGravity(game) {
    const { lastUpdatedAt, startedAt, timestamp } = this;
    const dt = timestamp - startedAt - lastUpdatedAt;
    const dy = Math.floor(dt * game.gravity / FRAME_LENGTH_AT_60_FPS);

    if (dy) this.lastUpdatedAt = timestamp - startedAt;
    return game.moveTetrimino([0, dy]);
  }

  hardDropTetrimino() {
    const { game } = this;

    return new RowsClearingState({
      ...this,
      game: game.hardDropTetrimino().lockTetrimino(),
    });
  }

  moveTetrimino(direction) {
    const { game, lockExpiry, timestamp } = this;
    const next = game.moveTetrimino(direction);

    if (next === game) return this;
    if (lockExpiry) {
      this.lockExpiry = timestamp + LOCK_DELAY;
      --this.movesLeft;
    }
    return new GravityState({ ...this, game: next });
  }

  processInput(input) {
    switch (input) {
    case KEY.CTRL_LEFT:
    case KEY.CTRL_RIGHT:
    case KEY.Z:
      return this.rotateTetrimino(DIRECTION.COUNTERCLOCKWISE);

    case KEY.DOWN_ARROW:
    case KEY.S:
      return this.moveTetrimino(DIRECTION.DOWN);

    case KEY.ESCAPE:
    case KEY.F1:
      return new PausedState(this);

    case KEY.LEFT_ARROW:
    case KEY.A:
      return this.moveTetrimino(DIRECTION.LEFT);

    case KEY.RIGHT_ARROW:
    case KEY.D:
      return this.moveTetrimino(DIRECTION.RIGHT);

    case KEY.SPACE:
      return this.hardDropTetrimino();

    case KEY.UP_ARROW:
    case KEY.X:
      return this.rotateTetrimino(DIRECTION.CLOCKWISE);

    default: return this;
    }
  }

  rotateTetrimino(direction) {
    const { game, lockExpiry, timestamp } = this;
    const next = game.rotateTetrimino(direction);

    if (next === this.game) return this;
    if (lockExpiry) {
      this.lockExpiry = timestamp + LOCK_DELAY;
      --this.movesLeft;
    }
    return new GravityState({ ...this, game: next });
  }

  update(timestamp) {
    let { game } = this;

    this.timestamp = timestamp;
    if (!this.startedAt) this.startedAt = timestamp;

    if (!game.tetrimino) game = game.shiftQueue();

    game = this.applyGravity(game);
    if (game.isValidChunk(game.tetrimino.move(DIRECTION.DOWN))) {
      return new GravityState({ ...this, game, lockExpiry: 0 });
    } else if (!this.lockExpiry) {
      return new GravityState({
        ...this,
        game,
        lockExpiry: timestamp + LOCK_DELAY,
        movesLeft: 15,
      });
    } else if (timestamp > this.lockExpiry || !this.movesLeft) {
      return new RowsClearingState({
        ...this,
        game: game.lockTetrimino(),
      });
    } else if (game.tetrimino.y === 0) {
      return new NewGameState({ game: game.reset() });
    }
    return this;
  }
}
