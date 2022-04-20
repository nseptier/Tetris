import State from 'enums/state';

export default class GameOverState {
  constructor({ game }) {
    this.game = game;
    this.name = State.GAME_OVER;
  }

  processInput() {
    return this;
  }

  update() {
    return this;
  }
}
