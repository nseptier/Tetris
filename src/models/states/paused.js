import GravityState from 'models/states/gravity';
import key from 'enums/key';
import State from 'enums/state';

export default class PausedState {
  constructor({ game }) {
    this.game = game;
    this.name = State.PAUSED;
  }

  processInput(input) {
    switch (input) {
    case key.ESCAPE:
    case key.F1:
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
