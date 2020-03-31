import State from 'enums/state';

const BLOCK_PIXELS = 8;
const UNIT = 24;
const PIXEL = UNIT / BLOCK_PIXELS;

const colors = ['#313233', '#586040', '#738459', '#b7c58e'];

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

      textCtx.fillStyle = /[[\]]/.test(c) ? '#C2185B' : 'black';
      textCtx.fillText(c, x, y);
      x += textCtx.measureText(c).width;
    }
  };

  const hideText = () => {
    textCanvas.classList.remove('--visible');
  };

  const renderIBlock = (x, y, ctx, tetrimino, order) => {
    const drawPoint = (dx, dy) => ctx.fillRect(
      x * UNIT + dx * PIXEL,
      y * UNIT + dy * PIXEL,
      PIXEL,
      PIXEL,
    );

    if (tetrimino.rotation % 2) {
      ctx.save();
      ctx.translate((x + 0.5) * UNIT, (y + 0.5) * UNIT);
      ctx.rotate(90 * Math.PI / 180);
      ctx.translate(-(x + 0.5) * UNIT, -(y + 0.5) * UNIT);
    }

    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    switch (order) {
    case 1:
      ctx.fillStyle = colors[2];
      ctx.fillRect(
        x * UNIT + PIXEL,
        y * UNIT + PIXEL,
        UNIT - PIXEL,
        UNIT - 2 * PIXEL,
      );

      ctx.fillStyle = colors[1];
      drawPoint(2, 1);
      drawPoint(5, 1);
      drawPoint(1, 3);
      drawPoint(4, 3);
      drawPoint(6, 3);
      drawPoint(2, 5);
      drawPoint(6, 5);
      drawPoint(4, 6);
      break;

    case 4:
      ctx.fillStyle = colors[2];
      ctx.fillRect(
        x * UNIT,
        y * UNIT + PIXEL,
        UNIT - PIXEL,
        UNIT - 2 * PIXEL,
      );

      ctx.fillStyle = colors[1];
      drawPoint(0, 1);
      drawPoint(1, 4);
      drawPoint(2, 2);
      drawPoint(2, 6);
      drawPoint(3, 4);
      drawPoint(4, 1);
      drawPoint(4, 6);
      drawPoint(5, 3);
      drawPoint(6, 5);
      break;

    default:
      ctx.fillStyle = colors[2];
      ctx.fillRect(
        x * UNIT,
        y * UNIT + PIXEL,
        UNIT,
        UNIT - 2 * PIXEL,
      );

      ctx.fillStyle = colors[1];
      drawPoint(0, 1);
      drawPoint(2, 1);
      drawPoint(4, 1);
      drawPoint(6, 2);
      drawPoint(2, 3);
      drawPoint(0, 4);
      drawPoint(5, 4);
      drawPoint(3, 5);
      drawPoint(7, 5);
      drawPoint(1, 6);
      drawPoint(5, 6);
    }

    if (tetrimino.rotation % 2) {
      ctx.restore();
    }
  };

  const renderJBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * UNIT + PIXEL,
      y * UNIT + PIXEL,
      UNIT - 2 * PIXEL,
      UNIT - 2 * PIXEL,
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * UNIT + 2 * PIXEL,
      y * UNIT + 2 * PIXEL,
      UNIT - 4 * PIXEL,
      UNIT - 4 * PIXEL,
    );

    ctx.clearRect(
      x * UNIT + 3 * PIXEL,
      y * UNIT + 3 * PIXEL,
      UNIT - 6 * PIXEL,
      UNIT - 6 * PIXEL,
    );
  };

  const renderLBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    ctx.fillStyle = colors[1];
    ctx.fillRect(
      x * UNIT + PIXEL,
      y * UNIT + PIXEL,
      UNIT - 2 * PIXEL,
      UNIT - 2 * PIXEL,
    );
  };

  const renderOBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    ctx.clearRect(
      x * UNIT + PIXEL,
      y * UNIT + PIXEL,
      UNIT - 2 * PIXEL,
      UNIT - 2 * PIXEL,
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * UNIT + 2 * PIXEL,
      y * UNIT + 2 * PIXEL,
      UNIT - 4 * PIXEL,
      UNIT - 4 * PIXEL,
    );
  };

  const renderSBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    ctx.fillStyle = colors[1];
    ctx.fillRect(
      x * UNIT + PIXEL,
      y * UNIT + PIXEL,
      UNIT - 2 * PIXEL,
      UNIT - 2 * PIXEL,
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * UNIT + 2 * PIXEL,
      y * UNIT + 2 * PIXEL,
      UNIT - 4 * PIXEL,
      UNIT - 4 * PIXEL,
    );

    ctx.clearRect(
      x * UNIT + 3 * PIXEL,
      y * UNIT + 3 * PIXEL,
      UNIT - 6 * PIXEL,
      UNIT - 6 * PIXEL,
    );
  };

  const renderTBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * UNIT + PIXEL,
      y * UNIT + PIXEL,
      UNIT - 2 * PIXEL,
      UNIT - 2 * PIXEL,
    );

    ctx.fillStyle = colors[3];
    ctx.fillRect(
      x * UNIT + 2 * PIXEL,
      y * UNIT + 2 * PIXEL,
      UNIT - 4 * PIXEL,
      UNIT - 4 * PIXEL,
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * UNIT + 2 * PIXEL,
      y * UNIT + 5 * PIXEL,
      PIXEL,
      PIXEL,
    );
    ctx.fillRect(
      x * UNIT + 3 * PIXEL,
      y * UNIT + 3 * PIXEL,
      UNIT - 5 * PIXEL,
      UNIT - 5 * PIXEL,
    );

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * UNIT + 3 * PIXEL,
      y * UNIT + 3 * PIXEL,
      UNIT - 6 * PIXEL,
      UNIT - 6 * PIXEL,
    );
  };

  const renderZBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * UNIT + PIXEL,
      y * UNIT + PIXEL,
      UNIT - 2 * PIXEL,
      UNIT - 2 * PIXEL,
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * UNIT + 3 * PIXEL,
      y * UNIT + 3 * PIXEL,
      UNIT - 6 * PIXEL,
      UNIT - 6 * PIXEL,
    );
  };

  const renderBlock = (tetrimino, order, x, y, ctx = gameBoardCtx) => {
    switch (tetrimino?.shape) {
    case 'i': renderIBlock(x, y, ctx, tetrimino, order); break;
    case 'j': renderJBlock(x, y, ctx, tetrimino, order); break;
    case 'l': renderLBlock(x, y, ctx, tetrimino, order); break;
    case 'o': renderOBlock(x, y, ctx, tetrimino, order); break;
    case 's': renderSBlock(x, y, ctx, tetrimino, order); break;
    case 't': renderTBlock(x, y, ctx, tetrimino, order); break;
    case 'z': renderZBlock(x, y, ctx, tetrimino, order); break;
    default:
      ctx.fillStyle = colors[0];
      ctx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);
    }
  };

  const renderLockedBlocks = ({
    fullRowsIndexes,
    lockedBlocks,
    tetriminoes,
  }) => {
    gameBoardCtx.clearRect(0, 0, width * UNIT, height * UNIT);
    for (let y = 0; y < lockedBlocks.length; y++) {
      for (let x = 0; x < lockedBlocks[y].length; x++) {
        if (!lockedBlocks[y][x]) continue;

        if (fullRowsIndexes.includes(y)) {
          gameBoardCtx.fillStyle = '#C2185B';
        } else {
          gameBoardCtx.fillStyle = lockedBlocks[y][x]
            ? '#fff'
            : 'rgba(255, 255, 255, .05)';
        }
        renderBlock(
          tetriminoes.byId[lockedBlocks[y][x].tetriminoId],
          lockedBlocks[y][x].order,
          x,
          y,
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
        gameBoardCtx.fillStyle = colors[2];
        gameBoardCtx.fillRect(
          (ghost.x + x) * UNIT + PIXEL,
          (ghost.y + y) * UNIT + PIXEL,
          UNIT - 2 * PIXEL,
          UNIT - 2 * PIXEL,
        );
        gameBoardCtx.clearRect(
          (ghost.x + x) * UNIT + 2 * PIXEL,
          (ghost.y + y) * UNIT + 2 * PIXEL,
          UNIT - 4 * PIXEL,
          UNIT - 4 * PIXEL,
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
            tetrimino,
            tetrimino.blocks[y][x] || x + 1,
            x,
            y,
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
          tetrimino,
          tetrimino.blocks[y][x],
          tetrimino.x + x,
          tetrimino.y + y,
        );
      }
    }
  };

  return {
    render({ game, name: state }) {
      const {
        fullRowsIndexes,
        ghost,
        lockedBlocks,
        queue,
        tetrimino,
        tetriminoes,
      } = game;

      renderLockedBlocks({ fullRowsIndexes, lockedBlocks, tetriminoes });
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
