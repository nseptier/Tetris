import autobind from 'autobind-decorator';

export default class Core {
  constructor({ inputsHandler, renderer, state }) {
    this.inputsHandler = inputsHandler;
    this.renderer = renderer;
    this.state = state;
  }

  @autobind
  loop(timestamp) {
    this.state = this.state
      .processInput(this.inputsHandler, timestamp)
      .update(timestamp);
    this.render(timestamp);
    window.requestAnimationFrame(this.loop.bind(this));
  }

  render(timestamp) {
    this.renderer.render({ ...this.state, timestamp });
  }
}
