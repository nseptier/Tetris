import GravityState from 'models/gravity-state';
import KEY from 'enums/key';
import STATE from 'enums/state';

export default class PausedState {
  constructor({ game }) {
    this.game = game;
    this.name = STATE.PAUSED;
  }

  processInput(input) {
    switch (input) {
    case KEY.ESCAPE:
    case KEY.F1:
      return new GravityState({
        ...this,
        lastUpdatedAt: this.timestamp,
        startedAt: this.timestamp,
      });

    default: return this;
    }
  }

  update() {
    return this;
  }
}
