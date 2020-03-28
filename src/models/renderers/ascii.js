import State from 'enums/state';

const UNIT = 20;

export default (width, height) => {
  const gameCanvas = document.createElement('canvas');
  const context = gameCanvas.getContext('2d');

  gameCanvas.height = UNIT * height;
  gameCanvas.width = UNIT * width;
  context.font = '16px "source code pro"';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  document.body.appendChild(gameCanvas);

  const displayMessage = message => {
    context.fillStyle = 'rgba(40, 40, 40, .33)';
    context.fillRect(0, 0, width * UNIT, height * UNIT);
    context.fillStyle = '#fff';
    context.fillText(
      message,
      width * UNIT / 2,
      height * UNIT / 2,
    );
  };

  const renderLockedBlocks = ({ fullRowsIndexes, lockedBlocks }) => {
    context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (let y = 0; y < lockedBlocks.length; y++) {
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
  };

  const renderGhost = ghost => {
    if (!ghost) return;

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
  };

  const renderTetrimino = tetrimino => {
    for (let y = 0; y < tetrimino.blocks.length; y++) {
      for (let x = 0; x < tetrimino.blocks[y].length; x++) {
        if (!tetrimino.blocks[y][x]) continue;

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
  };

  return {
    render({ game, name: state }) {
      const { fullRowsIndexes, ghost, lockedBlocks, tetrimino } = game;

      renderLockedBlocks({ fullRowsIndexes, lockedBlocks });

      if (tetrimino) {
        renderGhost(ghost);
        renderTetrimino(tetrimino);
      }

      if (state === State.NEW_GAME) displayMessage('Press [Enter]');
      if (state === State.PAUSED) displayMessage('Paused');
    },
  };
};
