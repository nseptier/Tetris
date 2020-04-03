import GravityState from 'models/states/gravity';

const CLEAR_DURATION = 1400;

export default class LinesClearState {
  constructor({ game, startedAt = 0 }) {
    this.game = game;
    this.startedAt = startedAt;
  }

  processInput() {
    return this;
  }

  update(timestamp) {
    let { game } = this;

    game = game.markFullLines();
    if (game.fullLinesIndexes.length) {
      if (!this.startedAt) {
        this.startedAt = timestamp;
        return new LinesClearState({ ...this, game });
      }
      if (timestamp < this.startedAt + CLEAR_DURATION) {
        return new LinesClearState({ ...this, game });
      }
      game = game.clearLines();
      return new LinesClearState({ game });
    }
    return new GravityState({ ...this, game });
  }
}
