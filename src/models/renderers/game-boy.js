import State from 'enums/state';

const BLINK_DURATION = 200;
const BLOCK_PIXELS = 8;
const UNIT = 24;
const PIXEL = UNIT / BLOCK_PIXELS;

// const colors = ['#414141', '#6b7353', '#8b956d', '#c4cfa1'];
const colors = ['#272718', '#686850', '#a0a086', '#c7c7a7'];

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

document.documentElement.style.setProperty('--color-0', colors[0]);
document.documentElement.style.setProperty('--color-1', colors[1]);
document.documentElement.style.setProperty('--color-2', colors[2]);
document.documentElement.style.setProperty('--color-3', colors[3]);

export default ({ height, width }) => {
  const [gameBoardCtx] = initCanvas('gameBoard', { height, width });
  const queueCanvas = [];
  const queueCtx = [];
  const textNode = document.getElementById('text');

  [...new Array(1)].forEach((tetrimino, i) => {
    const [ctx, canvas] = initCanvas(null, { height: 4, width: 4 });

    queueCanvas[i] = canvas;
    queueCtx[i] = ctx;
    document.getElementById('queue').appendChild(canvas);
  });

  const hideText = () => {
    textNode.classList.remove('--visible');
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

  const renderBlock = (x, y, tetrimino, order, ctx = gameBoardCtx) => {
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
    stack,
    startedAt,
    tetriminoes,
    timestamp,
  }) => {
    gameBoardCtx.clearRect(0, 0, width * UNIT, height * UNIT);
    for (let y = 0; y < stack.length; y++) {
      for (let x = 0; x < stack[y].length; x++) {
        if (!stack[y][x]) continue;

        if (fullRowsIndexes.includes(y)
          && Math.floor((timestamp - startedAt) / BLINK_DURATION) % 2) {
          gameBoardCtx.fillStyle = colors[2];
          gameBoardCtx.fillRect(x * UNIT, y * UNIT, UNIT, UNIT);
        } else {
          renderBlock(
            x,
            y,
            tetriminoes.byId[stack[y][x].tetriminoId],
            stack[y][x].order,
          );
        }
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
    queueCtx.forEach((ctx, i) => {
      const tetrimino = queue[i];

      queueCanvas[i].width = UNIT * tetriminoSize[tetrimino.shape][0];
      queueCanvas[i].height = UNIT * tetriminoSize[tetrimino.shape][1];
      ctx.clearRect(
        0,
        0,
        tetriminoSize[tetrimino.shape][0] * UNIT,
        tetriminoSize[tetrimino.shape][1] * UNIT,
      );
      ctx.font = '20px "source code pro"';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let y = 0; y < tetriminoSize[tetrimino.shape][1]; y++) {
        for (let x = 0; x < tetriminoSize[tetrimino.shape][0]; x++) {
          if (!tetrimino.blocks[y][x] && tetrimino.shape !== 'i') continue;

          renderBlock(
            x,
            y,
            tetrimino,
            tetrimino.blocks[y][x] || x + 1,
            ctx,
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
          tetrimino.x + x,
          tetrimino.y + y,
          tetrimino,
          tetrimino.blocks[y][x],
        );
      }
    }
  };

  const showText = text => {
    textNode.innerHTML = text;
    textNode.classList.add('--visible');
  };

  return {
    render({ game, name: state, startedAt, timestamp }) {
      const {
        fullRowsIndexes,
        ghost,
        queue,
        stack,
        tetrimino,
        tetriminoes,
      } = game;

      renderQueue(queue);
      renderLockedBlocks({
        fullRowsIndexes,
        stack,
        startedAt,
        tetriminoes,
        timestamp,
      });
      if (tetrimino) {
        renderGhost(ghost);
        renderTetrimino(tetrimino);
      }

      switch (state) {
      case State.NEW_GAME: showText('Press [Enter]'); break;
      case State.PAUSED: showText('Paused'); break;
      default: hideText();
      }
    },
  };
};
