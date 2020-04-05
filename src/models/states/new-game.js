import GravityState from 'models/states/gravity';
import Key from 'enums/key';
import State from 'enums/state';

export default class NewGameState {
  constructor({ game }) {
    this.game = game;
    this.name = State.NEW_GAME;
  }

  processInput(inputHandler) {
    const { game } = this;

    switch (inputHandler.read()) {
    case Key.ENTER:
      inputHandler.consume();
      return new GravityState({ game });

    default: return this;
    }
  }

  update() {
    return this;
  }
}
