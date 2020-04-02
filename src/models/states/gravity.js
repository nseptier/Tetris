import DIRECTION from 'enums/direction';
import key from 'enums/key';
import NewGameState from 'models/states/new-game';
import PausedState from 'models/states/paused';
import RowsClearingState from 'models/states/rows-clearing';
import State from 'enums/state';

const FRAME_LENGTH_AT_60_FPS = 1000 / 60;
const LOCK_DELAY = 500;

export default class GravityState {
  constructor({ game, lastUpdatedAt, lockExpiry, movesLeft, startedAt }) {
    this.game = game;
    this.lastUpdatedAt = lastUpdatedAt || 0;
    this.lockExpiry = lockExpiry || 0;
    this.movesLeft = movesLeft || 0;
    this.name = State.GRAVITY;
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
    if (!this.game.tetrimino) return this;

    switch (input) {
    case key.CTRL_LEFT:
    case key.CTRL_RIGHT:
    case key.Z:
      return this.rotateTetrimino(DIRECTION.COUNTERCLOCKWISE);

    case key.DOWN_ARROW:
    case key.S:
      return this.moveTetrimino(DIRECTION.DOWN);

    case key.ESCAPE:
    case key.F1:
      return new PausedState(this);

    case key.LEFT_ARROW:
    case key.A:
      return this.moveTetrimino(DIRECTION.LEFT);

    case key.RIGHT_ARROW:
    case key.D:
      return this.moveTetrimino(DIRECTION.RIGHT);

    case key.SPACE:
      return this.hardDropTetrimino();

    case key.UP_ARROW:
    case key.X:
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
    if (!game.isValidChunk(game.tetrimino)) {
      return new NewGameState({ game: game.reset() });
    }

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
        game: game.lockTetrimino(),
      });
    }
    return this;
  }
}
