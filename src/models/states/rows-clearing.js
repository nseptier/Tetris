import GravityState from 'models/states/gravity';

const CLEAR_DURATION = 1400;

export default class RowsClearingState {
  constructor({ game, startedAt = 0 }) {
    this.game = game;
    this.startedAt = startedAt;
  }

  processInput() {
    return this;
  }

  update(timestamp) {
    let { game } = this;

    game = game.markFullRows();
    if (game.fullRowsIndexes.length) {
      if (!this.startedAt) {
        this.startedAt = timestamp;
        return new RowsClearingState({ ...this, game });
      }
      if (timestamp < this.startedAt + CLEAR_DURATION) {
        return new RowsClearingState({ ...this, game });
      }
      game = game.emptyFullRows().dropLockedBlocks();
      return new RowsClearingState({ game });
    }
    return new GravityState({ ...this, game });
  }
}
