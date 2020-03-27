import GravityState from 'models/gravity-state';
import Key from 'enums/key';
import State from 'enums/state';

export default class NewGameState {
  constructor({ game }) {
    this.game = game;
    this.name = State.NEW_GAME;
  }

  processInput(input) {
    switch (input) {
    case Key.ENTER:
      return new GravityState(this);

    default: return this;
    }
  }

  update() {
    return this;
  }
}
