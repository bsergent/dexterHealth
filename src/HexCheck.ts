import $ = require('jquery');

enum State {
  EMPTY,
  HALF,
  FULL
}

export default class HexCheck {
  private _element:JQuery<HTMLElement>;
  private _state:State = State.EMPTY;
  private _name:string;
  private _triState:boolean;

  constructor(name:string, triState:boolean) {
    this._name = name;
    this._element = $('<div></div>');
    this._element.on('click', (event) => {
      switch (this._state) {
        case State.EMPTY:
          this.state = this._triState ? State.HALF : State.FULL;
          break;
        case State.HALF:
          this.state = State.FULL;
          break;
        case State.FULL:
          this.state = State.EMPTY;
          break;
      }
    });
    this.updateHTML();
  }

  get name():string {
    return this._name;
  }
  set name(newName) {
    this._name = newName;
    this.updateHTML();
  }
  get state():State {
    return this._state;
  }
  set state(newState:State) {
    this._state = newState;
    this.updateHTML();
  }
  get element():JQuery<HTMLElement> {
    return this._element;
  }

  private updateHTML():void {
    let attrClass:string = 'hexcheck';
    if (this._state == State.HALF)
      attrClass += ' half';
    if (this._state == State.FULL)
      attrClass += ' full';
    this._element.html('<div class="col-xs-6 col-sm-4 col-md-3"><div class="' + attrClass + '"><div></div> ' + this._name + '</div></div>');
  }
}