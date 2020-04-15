import autobind from 'autobind-decorator';
import Chunk from 'models/chunk';
import DIRECTION from 'enums/direction';
import Tetrimino, { SHAPES } from 'models/tetrimino';

const I_WALL_KICKS_TABLE = [
  [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
];

const JLSTZ_WALL_KICKS_TABLE = [
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
];

const LINE_CLEARS = [0, 1, 3, 5, 8];

const byId = Symbol('byId');
const currentId = Symbol('currentId');

const createRandomTetrimino = () => new Tetrimino({
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
});

export default class Game {
  constructor({
    fullLinesIndexes = [],
    height = 20,
    level = 0,
    lineClears = 0,
    queue,
    stack,
    tetrimino,
    width = 10,
    ...args
  } = {}) {
    this.fullLinesIndexes = fullLinesIndexes;
    this.height = stack ? stack.length : height;
    this.level = level;
    this.lineClears = lineClears;
    this.width = stack ? stack[0].length : width;
    this.stack = stack
      || [...new Array(height)].map(() => [...new Array(width)]);
    this.queue = queue || [];

    this[byId] = tetrimino
      ? { ...args[byId], [tetrimino.id]: tetrimino }
      : args[byId] ?? {};
    this[currentId] = tetrimino?.id;
  }

  get ghost() {
    if (!this.tetrimino) return null;
    return this.hardDropChunk(this.tetrimino);
  }

  // cells per frame at 60 fps (cells per second)
  get gravity() {
    if (this.level === 0) return 1 / 36;
    if (this.level === 1) return 1 / 32;
    if (this.level === 2) return 1 / 29;
    if (this.level === 3) return 1 / 25;
    if (this.level === 4) return 1 / 22;
    if (this.level === 5) return 1 / 18;
    if (this.level === 6) return 1 / 15;
    if (this.level === 7) return 1 / 11;
    if (this.level === 8) return 1 / 7;
    if (this.level === 9) return 1 / 5;
    if (this.level <= 12) return 1 / 4;
    if (this.level <= 15) return 1 / 3;
    if (this.level <= 18) return 1 / 2;
    return 1;
  }

  get tetrimino() {
    return this.tetriminoes.byId[this.tetriminoes.currentId];
  }

  get tetriminoes() {
    return { byId: this[byId], currentId: this[currentId] };
  }

  set tetrimino(tetrimino) {
    this[currentId] = tetrimino.id;
    this[byId] = { ...this[byId], [tetrimino.id]: tetrimino };
  }

  clearLines() {
    this.lineClears += LINE_CLEARS[this.fullLinesIndexes.length];
    if (this.lineClears >= (this.level + 1) * 5) {
      this.level += 1;
    }

    return this.emptyFullLines().dropLockedBlocks();
  }

  dropLockedBlocks() {
    const fullLinesIndexes = this.fullLinesIndexes.slice();
    let game = this;
    let end;

    while ((end = fullLinesIndexes.shift())) {
      const start = fullLinesIndexes[0] || 0;

      game = game.extractChunks(start, end)
        .reverse()
        .map(game.hardDropChunk)
        .reduce((state, chunk) => state.lockChunk(chunk), game);
    }
    return new Game({ ...game, fullLinesIndexes });
  }

  emptyFullLines() {
    const stack = this.stack.slice();

    return new Game({
      ...this,
      stack: stack.map((line, index) => (
        this.fullLinesIndexes.includes(index)
          ? [...new Array(this.width)]
          : line
      )),
    });
  }

  extractChunks(start, end) {
    const chunks = [];
    let chunk;

    for (let y = start; y < end; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isEmpty(x, y)) continue;

        chunk = chunks.find(chk => (
          chk.includes(`${x},${y}`) || chk.includes(`${x + 1},${y}`)
        ));
        if (!chunk) {
          chunks.push([]);
          chunk = chunks[chunks.length - 1];
        }
        if (!this.isEmpty(x + 1, y) && !chunk.includes(`${x + 1},${y}`)) {
          chunk.push(`${x + 1},${y}`);
        }
        if (!this.isEmpty(x, y + 1) && !chunk.includes(`${x},${y + 1}`)) {
          chunk.push(`${x},${y + 1}`);
        }
        if (!chunk.includes(`${x},${y}`)) chunk.push(`${x},${y}`);
      }
    }
    return chunks.map(strings => {
      const coordinates = strings.map(string => string.split(','));
      const xMax = Math.max(...coordinates.map(([x]) => x));
      const xMin = Math.min(...coordinates.map(([x]) => x));
      const yMax = Math.max(...coordinates.map(([, y]) => y));
      const yMin = Math.min(...coordinates.map(([, y]) => y));
      const blocks = [...new Array(yMax - yMin + 1)]
        .map(() => [...new Array(xMax - xMin + 1)]);

      coordinates.forEach(([x, y]) => {
        blocks[y - yMin][x - xMin] = this.stack[y][x];
        this.stack[y][x] = null; // @todo: do not mutate stack
      });
      return new Chunk({ blocks, x: xMin, y: yMin });
    });
  }

  @autobind
  hardDropChunk(chunk) {
    let next = chunk;

    while (this.isValidChunk(next.move(DIRECTION.DOWN))) {
      next = next.move(DIRECTION.DOWN);
    }
    return next;
  }

  hardDropTetrimino() {
    return new Game({ ...this, tetrimino: this.ghost });
  }

  initQueue(queueSize = 3) {
    return new Game({
      ...this,
      queue: [...new Array(queueSize)].map(createRandomTetrimino),
    });
  }

  isEmpty(x, y) {
    return this.stack[y] && !this.stack[y][x];
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  isValidChunk(chunk) {
    return chunk.blocks.every((line, y) => (
      line.every((block, x) => (
        !chunk.blocks[y][x]
          || (this.isEmpty(chunk.x + x, chunk.y + y)
            && !this.isOutOfBounds(chunk.x + x, chunk.y + y))
      ))
    ));
  }

  lockChunk(chunk, willForce) {
    const stack = this.stack.slice();

    chunk.blocks.forEach((line, y) => line.forEach((block, x) => {
      if (!block) return;
      stack[chunk.y + y][chunk.x + x] = willForce
        ? { order: block, tetriminoId: chunk.id }
        : chunk.blocks[y][x];
    }));
    return new Game({ ...this, stack });
  }

  lockTetrimino() {
    return new Game({
      ...this.lockChunk(this.tetrimino, true),
      tetrimino: null,
    });
  }

  markFullLines() {
    return new Game({
      ...this,
      fullLinesIndexes: this.stack
        .reduce(
          (fullLines, line, index) => (
            line.every(block => block) ? fullLines.concat(index) : fullLines
          ),
          [],
        )
        .reverse(),
    });
  }

  moveTetrimino([x, y]) {
    const next = this.tetrimino.move([x, y]);

    if (!this.isValidChunk(next)) return this;
    return new Game({ ...this, tetrimino: next });
  }

  reset() {
    return new Game({ height: this.height, width: this.width });
  }

  rotateTetrimino(angle) {
    if (this.tetrimino.shape === 'o') return this;

    let next = this.tetrimino;
    const index = angle === DIRECTION.CLOCKWISE
      ? next.rotation
      : next.rotate(angle).rotation;
    const wallKicks = next.shape === 'i'
      ? I_WALL_KICKS_TABLE[index]
      : JLSTZ_WALL_KICKS_TABLE[index];
    let i = 0;

    do {
      const [x, y] = wallKicks[i];
      next = this.tetrimino.rotate(angle).move([x * angle, y * angle]);
    } while (!this.isValidChunk(next) && wallKicks[++i]);
    return i < wallKicks.length
      ? new Game({ ...this, tetrimino: next })
      : this;
  }

  shiftQueue() {
    const queue = this.queue.slice();

    queue.push(createRandomTetrimino());

    let tetrimino = queue.shift();
    tetrimino = tetrimino.moveTo([
      Math.floor((this.width - tetrimino.blocks.length) / 2),
      0,
    ]);
    return new Game({ ...this, queue, tetrimino });
  }
}
