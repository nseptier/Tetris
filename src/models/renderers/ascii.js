import State from 'enums/state';

const UNIT = 25;
const tetriminoSize = {
  i: [4, 1],
  j: [3, 2],
  l: [3, 2],
  o: [2, 2],
  s: [3, 2],
  t: [3, 2],
  z: [3, 2],
};

const initCanvas = (id, { height, width }) => {
  const canvas = id
    ? document.getElementById(id)
    : document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.height = UNIT * height;
  canvas.width = UNIT * width;
  ctx.font = `${UNIT * 0.8}px "source code pro"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  return [ctx, canvas];
};

export default ({ height, queueSize, width }) => {
  const [gameBoardCtx] = initCanvas('gameBoard', { height, width });
  const [textCtx, textCanvas] = initCanvas('text', { height, width });
  const queueCanvas = [];
  const queueCtx = [];

  [...new Array(queueSize)].forEach((tetrimino, i) => {
    const [ctx, canvas] = initCanvas(null, { height: 4, width: 4 });

    queueCanvas[i] = canvas;
    queueCtx[i] = ctx;
    document.getElementById('queue').appendChild(canvas);
  });

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

  const renderBlock = (type, x, y, ctx = gameBoardCtx) => {
    ctx.fillText(type, x + UNIT / 2, y + UNIT / 2);
  };

  const renderLockedBlocks = ({ fullRowsIndexes, stack }) => {
    gameBoardCtx.clearRect(0, 0, width * UNIT, height * UNIT);
    for (let y = 0; y < stack.length; y++) {
      for (let x = 0; x < stack[y].length; x++) {
        if (fullRowsIndexes.includes(y)) {
          gameBoardCtx.fillStyle = '#C2185B';
        } else {
          gameBoardCtx.fillStyle = stack[y][x]
            ? '#fff'
            : 'rgba(255, 255, 255, .05)';
        }
        renderBlock(stack[y][x], x * UNIT, y * UNIT);
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
        renderBlock(
          ghost.blocks[y][x],
          (ghost.x + x) * UNIT,
          (ghost.y + y) * UNIT,
        );
      }
    }
  };

  const renderQueue = queue => {
    queue.forEach((tetrimino, i) => {
      queueCanvas[i].width = UNIT * tetriminoSize[tetrimino.shape][0];
      queueCanvas[i].height = UNIT * tetriminoSize[tetrimino.shape][1];
      queueCtx[i].clearRect(
        0,
        0,
        tetriminoSize[tetrimino.shape][0] * UNIT,
        tetriminoSize[tetrimino.shape][1] * UNIT,
      );
      queueCtx[i].font = '20px "source code pro"';
      queueCtx[i].fillStyle = 'white';
      queueCtx[i].textAlign = 'center';
      queueCtx[i].textBaseline = 'middle';

      for (let y = 0; y < tetriminoSize[tetrimino.shape][1]; y++) {
        for (let x = 0; x < tetriminoSize[tetrimino.shape][0]; x++) {
          if (!tetrimino.blocks[y][x] && tetrimino.shape !== 'i') continue;

          renderBlock(
            tetrimino.blocks[y][x] || 1,
            x * UNIT,
            y * UNIT,
            queueCtx[i],
          );
        }
      }
    });
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
        renderBlock(
          tetrimino.blocks[y][x],
          (tetrimino.x + x) * UNIT,
          (tetrimino.y + y) * UNIT,
        );
      }
    }
  };

  return {
    render({ game, name: state }) {
      const { fullRowsIndexes, ghost, queue, stack, tetrimino } = game;

      renderLockedBlocks({ fullRowsIndexes, stack });
      if (tetrimino) {
        renderGhost(ghost);
        renderTetrimino(tetrimino);
      }

      renderQueue(queue);

      switch (state) {
      case State.NEW_GAME: displayText('Press [Enter]'); break;
      case State.PAUSED: displayText('Paused'); break;
      default: hideText();
      }
    },
  };
};
