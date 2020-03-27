import GravityState from 'models/gravity-state';
import KEY from 'enums/key';
import STATE from 'enums/state';

export default class NewGameState {
  constructor({ game }) {
    this.game = game;
    this.name = STATE.NEW_GAME;
  }

  processInput(input) {
    switch (input) {
    case KEY.ENTER:
      return new GravityState(this);

    default: return this;
    }
  }

  update() {
    return this;
  }
}
