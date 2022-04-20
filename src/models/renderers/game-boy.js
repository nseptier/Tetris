import Char from 'utils/char';
import State from 'enums/state';

const BLINK_DURATION = 200;
const BLOCK_PIXEL_SIZE = 3;
const BLOCK_PIXELS = 8;
const BLOCK_SIZE = BLOCK_PIXELS * BLOCK_PIXEL_SIZE;

const CHAR_PIXEL_SIZE = 2;
const CHAR_PIXELS = 7;

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

const initCanvas = (id, { height, scale = BLOCK_SIZE, width }) => {
  const canvas = id
    ? document.getElementById(id)
    : document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.height = scale * height;
  canvas.width = scale * width;
  ctx.font = `${BLOCK_SIZE * 0.8}px "source code pro"`;
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
  const [dialogBoxCtx, dialogBoxCanvas] = initCanvas('dialogBox', {
    height: (CHAR_PIXELS + 1) * (3 + 2) - 1,
    scale: CHAR_PIXEL_SIZE,
    width: (CHAR_PIXELS + 1) * (10 + 2) - 1,
  });
  const queueCanvas = [];
  const queueCtx = [];

  const drawChar = (character, ctx, isActive) => {
    if (character === ' ') return;

    Char[character.toLowerCase()].forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = isActive ? colors[3] : colors[0];
          ctx.fillRect(
            x * CHAR_PIXEL_SIZE,
            y * CHAR_PIXEL_SIZE,
            CHAR_PIXEL_SIZE,
            CHAR_PIXEL_SIZE
          );
        }
      });
    });
  };

  const printString = (string, lineNumber, ctx, isActive) => {
    ctx.fillStyle = isActive ? colors[0] : colors[3];
    ctx.fillRect(
      (CHAR_PIXELS - 4) * CHAR_PIXEL_SIZE,
      ((lineNumber + 1) * (CHAR_PIXELS + 1) - 4) * CHAR_PIXEL_SIZE,
      ((CHAR_PIXELS + 1) * 10 - 1 + 8) * CHAR_PIXEL_SIZE,
      (CHAR_PIXELS + 8) * CHAR_PIXEL_SIZE
    );
    string.split('').forEach((character, i) => {
      ctx.save();
      ctx.translate(
        ((i + 1) * (CHAR_PIXELS + 1) - 1) * CHAR_PIXEL_SIZE,
        (lineNumber + 1) * (CHAR_PIXELS + 1) * CHAR_PIXEL_SIZE
      );
      drawChar(character, ctx, isActive);
      ctx.restore();
    });
  };

  [...new Array(1)].forEach((tetrimino, i) => {
    const [ctx, canvas] = initCanvas(null, { height: 4, width: 4 });

    queueCanvas[i] = canvas;
    queueCtx[i] = ctx;
    document.getElementById('queue').appendChild(canvas);
  });

  const renderIBlock = (x, y, ctx, tetrimino, order) => {
    const drawPoint = (dx, dy) => ctx.fillRect(
      x * BLOCK_SIZE + dx * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + dy * BLOCK_PIXEL_SIZE,
      BLOCK_PIXEL_SIZE,
      BLOCK_PIXEL_SIZE
    );

    if (tetrimino.rotation % 2) {
      ctx.save();
      ctx.translate((x + 0.5) * BLOCK_SIZE, (y + 0.5) * BLOCK_SIZE);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.translate(-(x + 0.5) * BLOCK_SIZE, -(y + 0.5) * BLOCK_SIZE);
    }

    ctx.fillStyle = colors[0];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    switch (order) {
    case 1:
      ctx.fillStyle = colors[2];
      ctx.fillRect(
        x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
        y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
        BLOCK_SIZE - BLOCK_PIXEL_SIZE,
        BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
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
        x * BLOCK_SIZE,
        y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
        BLOCK_SIZE - BLOCK_PIXEL_SIZE,
        BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
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
        x * BLOCK_SIZE,
        y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
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
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE
    );

    ctx.clearRect(
      x * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE
    );
  };

  const renderLBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    ctx.fillStyle = colors[1];
    ctx.fillRect(
      x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
    );
  };

  const renderOBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    ctx.clearRect(
      x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE
    );
  };

  const renderSBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    ctx.fillStyle = colors[1];
    ctx.fillRect(
      x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE
    );

    ctx.clearRect(
      x * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE
    );
  };

  const renderTBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[3];
    ctx.fillRect(
      x * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 5 * BLOCK_PIXEL_SIZE,
      BLOCK_PIXEL_SIZE,
      BLOCK_PIXEL_SIZE
    );
    ctx.fillRect(
      x * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 5 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 5 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE
    );
  };

  const renderZBlock = (x, y, ctx) => {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    ctx.fillStyle = colors[2];
    ctx.fillRect(
      x * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
    );

    ctx.fillStyle = colors[0];
    ctx.fillRect(
      x * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      y * BLOCK_SIZE + 3 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE,
      BLOCK_SIZE - 6 * BLOCK_PIXEL_SIZE
    );
  };

  const renderBlock = (x, y, tetrimino, order, ctx = gameBoardCtx) => {
    switch (tetrimino?.shape) {
    case 'i':
      renderIBlock(x, y, ctx, tetrimino, order);
      break;
    case 'j':
      renderJBlock(x, y, ctx, tetrimino, order);
      break;
    case 'l':
      renderLBlock(x, y, ctx, tetrimino, order);
      break;
    case 'o':
      renderOBlock(x, y, ctx, tetrimino, order);
      break;
    case 's':
      renderSBlock(x, y, ctx, tetrimino, order);
      break;
    case 't':
      renderTBlock(x, y, ctx, tetrimino, order);
      break;
    case 'z':
      renderZBlock(x, y, ctx, tetrimino, order);
      break;
    default:
      ctx.fillStyle = colors[0];
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
  };

  const renderLockedBlocks = ({
    fullLinesIndexes,
    stack,
    startedAt,
    tetriminoes,
    timestamp,
  }) => {
    gameBoardCtx.clearRect(0, 0, width * BLOCK_SIZE, height * BLOCK_SIZE);
    for (let y = 0; y < stack.length; y++) {
      for (let x = 0; x < stack[y].length; x++) {
        if (!stack[y][x]) continue;

        if (
          fullLinesIndexes.includes(y)
          && Math.floor((timestamp - startedAt) / BLINK_DURATION) % 2
        ) {
          gameBoardCtx.fillStyle = colors[2];
          gameBoardCtx.fillRect(
            x * BLOCK_SIZE,
            y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        } else {
          renderBlock(
            x,
            y,
            tetriminoes.byId[stack[y][x].tetriminoId],
            stack[y][x].order
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
          ghost.x * BLOCK_SIZE + x * BLOCK_SIZE,
          ghost.y * BLOCK_SIZE + y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        gameBoardCtx.fillStyle = colors[2];
        gameBoardCtx.fillRect(
          (ghost.x + x) * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
          (ghost.y + y) * BLOCK_SIZE + BLOCK_PIXEL_SIZE,
          BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE,
          BLOCK_SIZE - 2 * BLOCK_PIXEL_SIZE
        );
        gameBoardCtx.clearRect(
          (ghost.x + x) * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
          (ghost.y + y) * BLOCK_SIZE + 2 * BLOCK_PIXEL_SIZE,
          BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE,
          BLOCK_SIZE - 4 * BLOCK_PIXEL_SIZE
        );
      }
    }
  };

  const renderQueue = queue => {
    queueCtx.forEach((ctx, i) => {
      const tetrimino = queue[i];

      if (!tetrimino) return;
      queueCanvas[i].width = BLOCK_SIZE * tetriminoSize[tetrimino.shape][0];
      queueCanvas[i].height = BLOCK_SIZE * tetriminoSize[tetrimino.shape][1];
      ctx.clearRect(
        0,
        0,
        tetriminoSize[tetrimino.shape][0] * BLOCK_SIZE,
        tetriminoSize[tetrimino.shape][1] * BLOCK_SIZE
      );
      ctx.font = '20px "source code pro"';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let y = 0; y < tetriminoSize[tetrimino.shape][1]; y++) {
        for (let x = 0; x < tetriminoSize[tetrimino.shape][0]; x++) {
          if (!tetrimino.blocks[y][x] && tetrimino.shape !== 'i') continue;

          renderBlock(x, y, tetrimino, tetrimino.blocks[y][x] || x + 1, ctx);
        }
      }
    });
  };

  const renderTetrimino = tetrimino => {
    for (let y = 0; y < tetrimino.blocks.length; y++) {
      for (let x = 0; x < tetrimino.blocks[y].length; x++) {
        if (!tetrimino.blocks[y][x]) continue;

        gameBoardCtx.clearRect(
          (tetrimino.x + x) * BLOCK_SIZE,
          (tetrimino.y + y) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        gameBoardCtx.fillStyle = '#C2185B';
        renderBlock(
          tetrimino.x + x,
          tetrimino.y + y,
          tetrimino,
          tetrimino.blocks[y][x]
        );
      }
    }
  };

  return {
    render({ game, level, menuIndex, name: state, startedAt, timestamp }) {
      const {
        fullLinesIndexes,
        ghost,
        queue,
        stack,
        tetrimino,
        tetriminoes,
      } = game;

      renderQueue(queue);
      renderLockedBlocks({
        fullLinesIndexes,
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
      case State.NEW_GAME:
        printString(
          `Level   ${String(level + 1).padStart(2, 0)}`,
          0,
          dialogBoxCtx,
          menuIndex === 0
        );
        printString('New game', 2, dialogBoxCtx, menuIndex === 1);
        return;

      case State.PAUSED:
        printString('  Paused  ', 0, dialogBoxCtx, menuIndex === 0);
        return;

      case State.GAME_OVER:
        printString('Game over', 0, dialogBoxCtx, menuIndex === 0);
        return;

      default:
        dialogBoxCtx.clearRect(
          0,
          0,
          dialogBoxCanvas.width,
          dialogBoxCanvas.height
        );
      }
    },
  };
};
