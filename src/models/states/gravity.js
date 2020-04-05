import DIRECTION from 'enums/direction';
import key from 'enums/key';
import LinesClearState from 'models/states/lines-clear';
import NewGameState from 'models/states/new-game';
import PausedState from 'models/states/paused';
import State from 'enums/state';

const DAS_DELAY = 1000 / 16 * 4;
const FRAME_LENGTH_AT_60_FPS = 1000 / 60;
const LOCK_DELAY = 500;

export default class GravityState {
  constructor({ das, game, lastUpdatedAt, lockExpiry, movesLeft, startedAt }) {
    this.das = das;
    this.game = game;
    this.lastUpdatedAt = lastUpdatedAt || 0;
    this.lockExpiry = lockExpiry || 0;
    this.movesLeft = movesLeft || 0;
    this.name = State.GRAVITY;
    this.startedAt = startedAt || 0;
  }

  applyGravity(game, timestamp) {
    const { lastUpdatedAt, startedAt } = this;
    const dt = timestamp - startedAt - lastUpdatedAt;
    const dy = Math.floor(dt * game.gravity / FRAME_LENGTH_AT_60_FPS);

    if (dy) this.lastUpdatedAt = timestamp - startedAt;
    return game.moveTetrimino([0, dy]);
  }

  delayAutoShift(direction, timestamp) {
    const { das } = this;

    if (das) {
      if (timestamp < das) return this;
      return this.moveTetrimino(direction, timestamp);
    }
    return new GravityState({
      ...this.moveTetrimino(direction, timestamp),
      das: timestamp + DAS_DELAY,
    });
  }

  hardDropTetrimino() {
    const { game } = this;

    return new LinesClearState({
      game: game.hardDropTetrimino().lockTetrimino(),
    });
  }

  moveTetrimino(direction, timestamp) {
    const { game, lockExpiry } = this;
    const next = game.moveTetrimino(direction);

    if (next === game) return this;
    if (lockExpiry) {
      this.lockExpiry = timestamp + LOCK_DELAY;
      --this.movesLeft;
    }
    return new GravityState({ ...this, game: next });
  }

  processInput(inputHandler, timestamp) {
    const { game } = this;

    if (!inputHandler.read()) return new GravityState({ ...this, das: null });
    if (!game.tetrimino) return this;

    switch (inputHandler.read()) {
    case key.CTRL_LEFT:
    case key.CTRL_RIGHT:
    case key.Z:
      inputHandler.consume();
      return this.rotateTetrimino(DIRECTION.COUNTERCLOCKWISE, timestamp);

    case key.DOWN_ARROW:
    case key.S:
      return this.moveTetrimino(DIRECTION.DOWN, timestamp);

    case key.ESCAPE:
    case key.F1:
      inputHandler.consume();
      return new PausedState(this);

    case key.LEFT_ARROW:
    case key.A:
      return this.delayAutoShift(DIRECTION.LEFT, timestamp);

    case key.RIGHT_ARROW:
    case key.D:
      return this.delayAutoShift(DIRECTION.RIGHT, timestamp);

    case key.SPACE:
      inputHandler.consume();
      return this.hardDropTetrimino();

    case key.UP_ARROW:
    case key.X:
      inputHandler.consume();
      return this.rotateTetrimino(DIRECTION.CLOCKWISE, timestamp);

    default: return this;
    }
  }

  rotateTetrimino(direction, timestamp) {
    const { game, lockExpiry } = this;
    const next = game.rotateTetrimino(direction);

    if (next === this.game) return this;
    if (lockExpiry) {
      this.lockExpiry = timestamp + LOCK_DELAY;
      --this.movesLeft;
    }
    return new GravityState({ ...this, game: next });
  }

  update(timestamp) {
    const state = new GravityState(this);
    const { startedAt } = state;
    let { game } = state;

    if (!startedAt) state.startedAt = timestamp;
    if (!game.tetrimino) game = game.shiftQueue();
    if (!game.isValidChunk(game.tetrimino)) {
      return new NewGameState({ game: game.reset() });
    }

    game = state.applyGravity(game, timestamp);
    if (game.isValidChunk(game.tetrimino.move(DIRECTION.DOWN))) {
      return new GravityState({ ...state, game, lockExpiry: 0 });
    } else if (!state.lockExpiry) {
      return new GravityState({
        ...state,
        game,
        lockExpiry: timestamp + LOCK_DELAY,
        movesLeft: 15,
      });
    } else if (timestamp > state.lockExpiry || !state.movesLeft) {
      return new LinesClearState({
        game: game.lockTetrimino(),
      });
    }
    return state;
  }
}
