let lastId = 0;

export default class Chunk {
  constructor({ blocks, id = lastId++, x = 0, y = 0 }) {
    this.blocks = blocks;
    this.id = id;
    this.x = x;
    this.y = y;
  }

  move([dx, dy]) {
    return new this.constructor({ ...this, x: this.x + dx, y: this.y + dy });
  }
}
