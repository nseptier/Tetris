import Chunk from 'models/chunk';

/* .  .  .  .    .  .  4  .    .  .  .  .    .  2  .  .
   1  2  4  8    .  .  4  .    .  .  .  .    .  2  .  .
   .  .  .  .    .  .  4  .    1  2  4  8    .  2  .  .
   .  .  .  .    .  .  4  .    .  .  .  .    .  2  .  .
     0x00f0        0x4444        0x0f00        0x2222

   1  .  .    .  2  4    .  .  .    .  2  .
   1  2  4    .  2  .    1  2  4    .  2  .
   .  .  .    .  2  .    .  .  4    1  2  .
    0x071      0x226      0x470      0x322

   .  .  4    .  2  .    .  .  .    1  2  .
   1  2  4    .  2  .    1  2  4    .  2  .
   .  .  .    .  2  4    1  .  .    .  2  .
    0x074      0x622      0x170      0x223

   1  2
   1  2
   0x33

   .  2  4    .  2  .    .  .  .    1  .  .
   1  2  .    .  2  4    .  2  4    1  2  .
   .  .  .    .  .  4    1  2  .    .  2  .
   .  .  .    .  .  .    .  .  .    .  .  .
    0x036      0x462      0x360      0x231

   .  2  .    .  2  .    .  .  .    .  2  .
   1  2  4    .  2  4    1  2  4    1  2  .
   .  .  .    .  2  .    .  2  .    .  2  .
    0x072      0x262      0x270      0x232

   1  2  .    .  .  4    .  .  .    .  2  .
   .  2  4    .  2  4    1  2  .    1  2  .
   .  .  .    .  2  .    .  2  4    1  .  .
    0x063      0x264      0x630      0x132  */
const ENCODED_BLOCKS = [
  ['00f0', '4444', '0f00', '2222'],
  ['071', '226', '470', '322'],
  ['074', '622', '170', '223'],
  ['33'],
  ['036', '462', '360', '231'],
  ['072', '262', '270', '232'],
  ['063', '264', '630', '132'],
];

const BLOCKS = ENCODED_BLOCKS.map((encodedBlocks, index) => (
  encodedBlocks.map(encodedBlock => {
    const blocks = [];
    let row;

    for (let y = 0; y < encodedBlock.length; y++) {
      /* eslint-disable no-bitwise */
      row = (parseInt(encodedBlock, 16) >> (y * 4))
        & (Math.pow(2, encodedBlock.length) - 1);
      blocks[y] = [];
      for (let x = 0; x < encodedBlock.length; x++) {
        blocks[y][x] = row & Math.pow(2, x) ? index + 1 : 0;
      }
      /* eslint-enable no-bitwise */
    }
    return blocks;
  })
));

export const SHAPES = 'ijlostz'.split('');

export default class Tetrimino extends Chunk {
  constructor({ rotation = 0, shape, x, y }) {
    super({ blocks: BLOCKS[SHAPES.indexOf(shape)][rotation], x, y });
    this.rotation = rotation;
    this.shape = shape;
  }

  move([dx, dy]) {
    return new Tetrimino({ ...this, x: this.x + dx, y: this.y + dy });
  }

  moveTo([x, y]) {
    return new Tetrimino({ ...this, x, y });
  }

  rotate(direction) {
    const rotation = (this.rotation + direction % 4 + 4) % 4;

    return new Tetrimino({
      ...this,
      blocks: BLOCKS[SHAPES.indexOf(this.shape)][rotation],
      rotation,
    });
  }
}
