export default class Chunk {
  constructor({ blocks, x = 0, y = 0 }) {
    this.blocks = blocks;
    this.x = x;
    this.y = y;
  }

  move([dx, dy]) {
    return new Chunk({ ...this, x: this.x + dx, y: this.y + dy });
  }
}
