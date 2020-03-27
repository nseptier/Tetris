import autobind from 'autobind-decorator';

export default class InputsHandler {
  constructor(domNode) {
    this.inputs = [];
    domNode.addEventListener('keydown', this.handleKeyDown);
  }

  @autobind
  handleKeyDown(event) {
    this.inputs.push(event.code);
  }

  read() {
    return this.inputs.shift();
  }
}
