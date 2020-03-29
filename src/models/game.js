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

const createRandomTetrimino = () => new Tetrimino({
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
});

export default class Game {
  constructor({
    fullRowsIndexes = [],
    height = 20,
    lockedBlocks,
    queue,
    queueSize = 3,
    tetrimino,
    width = 10,
  } = {}) {
    this.fullRowsIndexes = fullRowsIndexes;
    this.gravity = 1 / 40; // cells per frame at 60 fps (cells per second)
    this.height = lockedBlocks ? lockedBlocks.length : height;
    this.width = lockedBlocks ? lockedBlocks[0].length : width;
    this.lockedBlocks = lockedBlocks
      || [...new Array(height)].map(() => [...new Array(width)].fill(0));
    this.queue = queue ?? this.initQueue(queueSize);
    this.tetrimino = tetrimino;
  }

  get ghost() {
    if (!this.tetrimino) return null;
    return this.hardDropChunk(this.tetrimino);
  }

  dropLockedBlocks() {
    const fullRowsIndexes = this.fullRowsIndexes.slice();
    let game = this;
    let end;

    while ((end = fullRowsIndexes.shift())) {
      const start = fullRowsIndexes[0] || 0;

      game = game.extractChunks(start, end)
        .reverse()
        .map(game.hardDropChunk)
        .reduce((state, chunk) => state.lockChunk(chunk), game);
    }
    return new Game({ ...game, fullRowsIndexes });
  }

  emptyFullRows() {
    const lockedBlocks = this.lockedBlocks.slice();

    return new Game({
      ...this,
      lockedBlocks: lockedBlocks.map((row, index) => (
        this.fullRowsIndexes.includes(index) ? Array(this.width).fill(0) : row
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
      const blocks = [...Array(yMax - yMin + 1)]
        .map(() => Array(xMax - xMin + 1).fill(0));

      coordinates.forEach(([x, y]) => {
        blocks[y - yMin][x - xMin] = this.lockedBlocks[y][x];
        this.lockedBlocks[y][x] = 0; // @todo: do not mutate lockedBlocks
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

  initQueue(size) {
    return [...Array(size)].map(() => this.initRandomTetrimino());
  }

  initRandomTetrimino() {
    const tetrimino = createRandomTetrimino();

    return tetrimino.moveTo([
      Math.floor((this.width - tetrimino.blocks.length) / 2),
      0,
    ]);
  }

  isEmpty(x, y) {
    return this.lockedBlocks[y] && !this.lockedBlocks[y][x];
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  isValidChunk(chunk) {
    return chunk.blocks.every((row, y) => (
      row.every((block, x) => (
        !chunk.blocks[y][x]
          || (this.isEmpty(chunk.x + x, chunk.y + y)
            && !this.isOutOfBounds(chunk.x + x, chunk.y + y))
      ))
    ));
  }

  lockChunk(chunk) {
    const lockedBlocks = this.lockedBlocks.slice();

    chunk.blocks.forEach((row, y) => row.forEach((block, x) => {
      if (!block) return;
      lockedBlocks[chunk.y + y][chunk.x + x] = block;
    }));
    return new Game({ ...this, lockedBlocks });
  }

  lockTetrimino() {
    return new Game({
      ...this.lockChunk(this.tetrimino),
      tetrimino: null,
    });
  }

  markFullRows() {
    return new Game({
      ...this,
      fullRowsIndexes: this.lockedBlocks
        .reduce(
          (fullRows, row, index) => (
            row.every(block => block) ? fullRows.concat(index) : fullRows
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

    queue.push(this.initRandomTetrimino());
    return new Game({ ...this, queue, tetrimino: queue.shift() });
  }
}
