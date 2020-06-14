import GravityState from 'models/states/gravity';
import Key from 'enums/key';
import Menu from 'enums/menu';
import State from 'enums/state';

const menu = [
  Menu.START_LEVEL,
  Menu.NEW_GAME,
];

export default class NewGameState {
  constructor({ game, level = 0 }) {
    this.game = game;
    this.level = level;
    this.menuIndex = 0;
    this.name = State.NEW_GAME;
  }

  processInput(inputHandler) {
    const { game } = this;

    switch (inputHandler.read()) {
    case Key.ENTER:
      inputHandler.consume();
      return new GravityState({ game: game.initQueue(1) });

    case Key.DOWN_ARROW:
      inputHandler.consume();
      if (menu[this.menuIndex] !== Menu.START_LEVEL) return this;
      return new NewGameState({ ...this, menuIndex: this.menuIndex + 1 });

    case Key.LEFT_ARROW:
      inputHandler.consume();
      if (menu[this.menuIndex] !== Menu.START_LEVEL || !this.level) return this;
      return new NewGameState({ ...this, level: this.level - 1 });

    case Key.RIGHT_ARROW:
      inputHandler.consume();
      if (menu[this.menuIndex] !== Menu.START_LEVEL
        || this.level === 19) {
        return this;
      }
      return new NewGameState({ ...this, level: this.level + 1 });

    default: return this;
    }
  }

  update() {
    return this;
  }
}
