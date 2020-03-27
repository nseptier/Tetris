import GravityState from 'models/gravity-state';

const CLEAR_DURATION = 500;

export default class RowsClearingState {
  constructor({ game, startsAt = 0 }) {
    this.game = game;
    this.startsAt = startsAt;
  }

  processInput() {
    return this;
  }

  update(timestamp) {
    let { game } = this;

    game = game.markFullRows();
    if (game.fullRowsIndexes.length) {
      if (!this.startsAt) {
        this.startsAt = timestamp;
        return new RowsClearingState({ ...this, game });
      }
      if (timestamp < this.startsAt + CLEAR_DURATION) return this;
      game = game.emptyFullRows().dropLockedBlocks();
      return new RowsClearingState({ game });
    }
    return new GravityState({ ...this, game });
  }
}
