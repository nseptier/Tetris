import GravityState from 'models/states/gravity';
import Key from 'enums/key';
import Menu from 'enums/menu';
import State from 'enums/state';

const menu = [
  Menu.START_LEVEL,
  Menu.NEW_GAME,
];

export default class NewGameState {
  constructor({ game, level = 0, menuIndex = 0 }) {
    this.game = game;
    this.level = level;
    this.menuIndex = menuIndex;
    this.name = State.NEW_GAME;
  }

  processInput(inputHandler) {
    const { game } = this;

    switch (inputHandler.read()) {
    case Key.ENTER:
      inputHandler.consume();
      if (menu[this.menuIndex] !== Menu.NEW_GAME) return this;
      return new GravityState({
        game: game.reset({ level: this.level }).initQueue(1)
      });

    case Key.DOWN_ARROW:
      inputHandler.consume();
      if (this.menuIndex === menu.length - 1) return this;
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

    case Key.UP_ARROW:
      inputHandler.consume();
      if (!this.menuIndex) return this;
      return new NewGameState({ ...this, menuIndex: this.menuIndex - 1 });

    default: return this;
    }
  }

  update() {
    return this;
  }
}
