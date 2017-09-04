import moment from 'moment';

interface Box {
  x:number,
  y:number,
  w:number,
  h:number
}
interface Color {
  r:number,
  g:number,
  b:number
}
interface Frame {
  duration:number,
  filename:string,
  frame:Box,
  rotated:boolean,
  sourceSize: {
    w:number,
    h:number
  },
  spriteSourceSize:Box,
  trimmed:boolean
}
interface Tag {
  name:string,
  from:number,
  to:number,
  direction:string
}
interface Meta {
  app:string,
  version:string,
  image:string,
  format:string,
  size: {
    w:number,
    h:number
  },
  scale:number,
  frameTags:Tag[]
}
interface TagDictionary {
  [name:string]:Tag
}

export default class AnimationSheet {
  private _json:string;
  private _frames:Frame[];
  private _width:number;
  private _height:number;
  private _image:HTMLImageElement;
  private _tags:TagDictionary;
  private _defaultTag:string;
  private _currentTag:string;
  private _currentFrameIndex:number;
  private _lastAnimationTime:moment.Moment;
  private _animating:boolean = true;
  private _tint:Color;

  constructor(imageURL:string, jsonURL:string) {
    let json:{frames:Frame[], meta:Meta};
    // Load json
    $.ajax({
      type: 'GET',
      url: jsonURL,
      dataType: 'json',
      success: function(data) {
        json = data;
      },
      async: false
    });

    // Parse json
    this._frames = json.frames;
    this._width = json.meta.size.w;
    this._height = json.meta.size.h;
    this._image = new Image();
    this._image.src = imageURL;
    this._tags = {};

    for (var i = 0; i < json.meta.frameTags.length; i++) {
      var tag = json.meta.frameTags[i];
      this._tags[tag.name] = tag;
      if (i == 0) this._defaultTag = tag.name;
    }

    this._lastAnimationTime = moment();
    this._currentTag = this._defaultTag;
    this._currentFrameIndex = this._tags[this._defaultTag].from;
  }

  public draw(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void {
    // Advance frame if necessary
    if (this._animating) {
      if (this._lastAnimationTime < moment().subtract(this._frames[this._currentFrameIndex].duration, 'ms')) {
        this._currentFrameIndex++;
        if (this._currentFrameIndex > this._tags[this._currentTag].to)
          this._currentFrameIndex = this._tags[this._currentTag].from;
        this._lastAnimationTime = moment();
      }
    }

    // Draw
    var frame = this.getCurrentFrame();
    ctx.drawImage(this._image, frame.x, frame.y, frame.w, frame.h, x, y, width, height);

    // TODO Make this not colorize the entire canvas
    if (this._tint) {
      var imageData = ctx.getImageData(0, 0, this._width, this._height);
      var pixelChannels = imageData.data;
      for (var i = 0; i < pixelChannels.length; i+=4) {
        if (pixelChannels[i] == pixelChannels[i+1]
              && pixelChannels[i+1] == pixelChannels[i+2]) {
          // Recolor white pixels to the color specified
          pixelChannels[i  ] = Math.min(Math.floor(pixelChannels[i  ] * this._tint.r), 255);
          pixelChannels[i+1] = Math.min(Math.floor(pixelChannels[i+1] * this._tint.g), 255);
          pixelChannels[i+2] = Math.min(Math.floor(pixelChannels[i+2] * this._tint.b), 255);
        }
      }
      ctx.putImageData(imageData,0,0);
    }
  }
  
  public getCurrentFrame():Box {
    return {
      x: this._frames[this._currentFrameIndex].frame.x,
      y: this._frames[this._currentFrameIndex].frame.y,
      w: this._frames[this._currentFrameIndex].frame.w,
      h: this._frames[this._currentFrameIndex].frame.h
    }
  }

  public setAnimation(frameTag:string):void {
    this._currentTag = frameTag;
    this._currentFrameIndex = this._tags[this._currentTag].from;
    this._lastAnimationTime = moment();
  }

  public getAnimation():string {
    return this._currentTag;
  }

  public colorize(r:number, g:number, b:number):void { // Only works with grayscale images
    this._tint = {
      r: r / 255,
      g: g / 255,
      b: b / 255
    };
  }

  public setAnimating(newValue:boolean):void {
    this._animating = newValue;
  }

  public isAnimating():boolean {
    return this._animating;
  }
}