import Core from 'models/core';
import Game from 'models/game';
import InputsHandler from 'models/inputs-handler';
import NewGameState from 'models/new-game-state';
import State from 'enums/state';
import './styles.scss';

const UNIT = 20;
const WIDTH = 10;
const HEIGHT = 22;

const gameCanvas = document.createElement('canvas');
gameCanvas.height = UNIT * HEIGHT;
gameCanvas.width = UNIT * WIDTH;
document.body.appendChild(gameCanvas);

const renderer = {
  render: function render(args) {
    this.renderGame(args);
  },

  renderGame: ({ game, name: state }) => {
    const { fullRowsIndexes, ghost, lockedBlocks, tetrimino } = game;
    const context = gameCanvas.getContext('2d');

    const displayMessage = message => {
      context.fillStyle = 'rgba(40, 40, 40, .33)';
      context.fillRect(0, 0, WIDTH * UNIT, HEIGHT * UNIT);
      context.fillStyle = '#fff';
      context.fillText(
        message,
        WIDTH * UNIT / 2,
        2 * UNIT + (HEIGHT - 2) * UNIT / 2,
      );
    };

    context.font = '16px "source code pro"';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // rendering locked blocks
    context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (let y = 2; y < lockedBlocks.length; y++) {
      for (let x = 0; x < lockedBlocks[y].length; x++) {
        if (fullRowsIndexes.includes(y)) {
          context.fillStyle = 'rgba(255, 255, 255, .33)';
        } else {
          context.fillStyle = lockedBlocks[y][x]
            ? '#fff'
            : 'rgba(255, 255, 255, .05)';
        }
        context.fillText(
          lockedBlocks[y][x],
          x * UNIT + UNIT / 2,
          y * UNIT + UNIT / 2,
        );
      }
    }

    // rendering falling tetrimino
    if (tetrimino) {
      // rendering falling tetrimino ghost
      if (ghost && tetrimino.y > 0) {
        for (let y = 0; y < ghost.blocks.length; y++) {
          for (let x = 0; x < ghost.blocks[y].length; x++) {
            if (!ghost.blocks[y][x]) continue;
            context.clearRect(
              ghost.x * UNIT + x * UNIT,
              ghost.y * UNIT + y * UNIT,
              UNIT,
              UNIT,
            );
            context.fillStyle = 'rgba(220, 20, 60, .33)';
            context.fillText(
              ghost.blocks[y][x],
              ghost.x * UNIT + x * UNIT + UNIT / 2,
              ghost.y * UNIT + y * UNIT + UNIT / 2,
            );
          }
        }
      }

      for (let y = 0; y < tetrimino.blocks.length; y++) {
        for (let x = 0; x < tetrimino.blocks[y].length; x++) {
          if ((tetrimino.y + y) < 2 || !tetrimino.blocks[y][x]) continue;
          context.clearRect(
            (tetrimino.x + x) * UNIT,
            (tetrimino.y + y) * UNIT,
            UNIT,
            UNIT,
          );
          context.fillStyle = 'crimson';
          context.fillText(
            tetrimino.blocks[y][x],
            (tetrimino.x + x) * UNIT + UNIT / 2,
            (tetrimino.y + y) * UNIT + UNIT / 2,
          );
        }
      }
    }

    if (state === State.NEW_GAME) {
      displayMessage('Press [Enter]');
    }

    if (state === State.PAUSED) {
      displayMessage('Paused');
    }
  },
};

const inputsHandler = new InputsHandler(document.body);
const game = new Game({ height: HEIGHT, width: WIDTH });
const state = new NewGameState({ game });
const core = new Core({ inputsHandler, renderer, state });

core.loop();
