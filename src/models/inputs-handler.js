import autobind from 'autobind-decorator';

export default class InputsHandler {
  constructor(domNode) {
    this.input = null;
    this.lock = null;
    domNode.addEventListener('keydown', this.onKeyDown);
    domNode.addEventListener('keyup', this.onKeyUp);
  }

  @autobind
  onKeyDown(event) {
    this.input = event.code;
  }

  @autobind
  onKeyUp() {
    this.input = null;
    this.lock = null;
  }

  consume() {
    this.lock = this.input;
  }

  read() {
    return this.lock === this.input ? null : this.input;
  }
}
