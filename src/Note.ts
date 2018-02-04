import $ from 'jquery';

// TODO Handle different types of notes other than boolean
// TODO Add doodles for certain notes like Piano, Class, Long drive, Worship, etc.

interface SimpleNote {
  label: string,
  type?: string,
  value?: any
}

export default class Note {
  private _element: JQuery<HTMLElement>;
  private _expanded: boolean = false;
  private _label: string;
  private _type: string;
  private _value: any;
  private _enum: string[];
  private _fireRef: firebase.database.Reference;

  constructor(label: string, type: string, value: any, fireRef: firebase.database.Reference) {
    this._label = label;
    if (type.startsWith('enum')) {
      this._type = 'enum';
      this._enum = type.slice(5).split(',');
    } else {
      this._type = type;
    }
    this._fireRef = fireRef;
    this._value = value;
    if (this._value === null) {
      switch (this._type) {
        case 'boolean':
          this._value = false;
          break;
        case 'number':
          this._value = 0;
          break;
        case 'enum':
          this._value = this._enum[0];
          break;
        case 'string':
          this._value = '';
          break;
      }
    }
    this._element = $('<div></div>');
    this.updateHTML();
  }

  public set value(newVal: any) {
    if (newVal === this._value) return;
    this._value = newVal;
    this._fireRef.set(this._value); // TODO Do all the references get broken after the first change?
    this.updateHTML();
  }

  public get value(): any {
    return this._value;
  }

  public get element(): JQuery<HTMLElement> {
    // Need to rebind the listener every time the HTML containing the Note is changed
    switch (this._type) {
      case 'boolean':
      case 'number':
      case 'enum':
        this._element.on('click', event => { this.click(event); });
        break;
      case 'string':
        let textarea = $(`#note_${this._label.replace(' ', '_')}_text`);
        textarea.keyup(event => { this._value = textarea.text(); });
        break;
    }
    return this._element;
  }
  
  public export(): SimpleNote {
    return {
      label: this._label,
      type: this._type,
      value: this._value
    };
  }
  
  private click(event: JQuery.Event<HTMLElement, null>) {
    switch (this._type) {
      case 'boolean':
        this.value = !this._value;
        break;
      case 'number':
        // TODO Popup counter (+ and - buttons with number in center)
        break;
      case 'enum':
        // TODO Popup selector (maybe option to add to enum) (title and sub bars w/ scrolling list in center and list as title icon)
        break;
      case 'string':
        // Inline textarea
        break;
    }
  }

  public updateHTML(): void {
    let html = '';
    html += '<div class="col-xs-6 col-sm-4 col-md-3">';
    switch (this._type) {
      case 'boolean':
        html += `<div class="hexcheck ${this._value?'full':''}"><div></div> ${this._label}</div>`;
        break;
      case 'number':
        break;
      case 'enum':
        html += `<div class="hexcheck ${this._value!==''?'full':''}"><div></div> ${this._label} <textarea id="note_${this._label.replace(' ', '_')}_text" rows="1">${this._value}</textarea id="" rows="1"></div>`;
        break;
      case 'string':
        html += `<div class="hexcheck ${this._value!==''?'full':''}"><div></div> ${this._label} <textarea id="note_${this._label}_text" rows="1">${this._value}</textarea id="" rows="1"></div>`;
        break;
    }
    html += '</div>';
    this._element.html(html);
  }
}