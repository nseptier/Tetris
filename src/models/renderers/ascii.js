import State from 'enums/state';

const UNIT = 25;

const initCanvas = (id, { height, width }) => {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');

  canvas.height = UNIT * height;
  canvas.width = UNIT * width;
  ctx.font = `${UNIT * 0.8}px "source code pro"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  return [ctx, canvas];
};

export default (width, height) => {
  const [gameBoardCtx] = initCanvas('gameBoard', { height, width });
  const [textCtx, textCanvas] = initCanvas('text', { height, width });

  const displayText = text => {
    let x = width * UNIT / 2 - textCtx.measureText(text).width / 2;
    const y = height * UNIT / 2;

    textCanvas.classList.add('--visible');
    textCtx.textAlign = 'left';
    textCtx.clearRect(0, 0, width * UNIT, height * UNIT);
    for (let i = 0; i < text.length; i++) {
      const c = text.charAt(i);

      textCtx.fillStyle = /[[\]]/.test(c) ? '#C2185B' : 'white';
      textCtx.fillText(c, x, y);
      x += textCtx.measureText(c).width;
    }
  };

  const hideText = () => {
    textCanvas.classList.remove('--visible');
  };

  const renderLockedBlocks = ({ fullRowsIndexes, lockedBlocks }) => {
    gameBoardCtx.clearRect(0, 0, width * UNIT, height * UNIT);
    for (let y = 0; y < lockedBlocks.length; y++) {
      for (let x = 0; x < lockedBlocks[y].length; x++) {
        if (fullRowsIndexes.includes(y)) {
          gameBoardCtx.fillStyle = '#C2185B';
        } else {
          gameBoardCtx.fillStyle = lockedBlocks[y][x]
            ? '#fff'
            : 'rgba(255, 255, 255, .05)';
        }
        gameBoardCtx.fillText(
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

        gameBoardCtx.clearRect(
          ghost.x * UNIT + x * UNIT,
          ghost.y * UNIT + y * UNIT,
          UNIT,
          UNIT,
        );
        gameBoardCtx.fillStyle = 'rgba(255, 255, 255, .25)';
        gameBoardCtx.fillText(
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

        gameBoardCtx.clearRect(
          (tetrimino.x + x) * UNIT,
          (tetrimino.y + y) * UNIT,
          UNIT,
          UNIT,
        );
        gameBoardCtx.fillStyle = '#C2185B';
        gameBoardCtx.fillText(
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

      switch (state) {
      case State.NEW_GAME: displayText('Press [Enter]'); break;
      case State.PAUSED: displayText('Paused'); break;
      default: hideText();
      }
    },
  };
};
