import $ = require('jquery');
import * as moment from '../node_modules/moment/moment';
import util = require('util');
import FitBit from 'FitBit';
import HexCheck from 'HexCheck';
import AnimationSheet from 'lib/AnimationSheet';

var selectedDate:moment.Moment = moment().subtract(5, 'hour'); // Start the next day at 5am
$('#date').text(selectedDate.format('dddd, MMM. Do'));

// FitBit
var fitbit = new FitBit();
fitbit.getWater(selectedDate).then((current) => {
  fitbit.getWaterGoal().then((goal) => {
    console.log('Water:' + current.toFixed(0) + '/' + goal.toFixed(0));
    let maxHeight = $('#water .icon').height();
    let $water = $('#water .icon > div:first-child');
    $water.css('height', Math.min(current / goal * maxHeight, maxHeight).toFixed(0) + 'px');
  });
});
fitbit.getFood(selectedDate).then((current) => {
  fitbit.getFoodGoal().then((goal) => {
    console.log('Food:' + current.toFixed(0) + '/' + goal.toFixed(0));
    let maxHeight = $('#food .icon').height();
    let $food = $('#food .icon > div:first-child');
    $food.css('height', Math.min(current / goal * maxHeight, maxHeight).toFixed(0) + 'px');
  });
});
fitbit.getExercise(selectedDate.startOf('isoWeek')).then((response:any) => {
  console.log('Exercise:' + response.current.toFixed(0) + '/' + response.goal.toFixed(0));
  let maxHeight = $('#exercise .icon').height();
  let $exercise = $('#exercise .icon > div:first-child');
  $exercise.css('height', Math.min(response.current / response.goal * maxHeight, maxHeight).toFixed(0) + 'px');
});


// Notes
let notes: string[] = ['flow', 'VR', 'NyQuil', 'worship', 'work', 'class', 'social', 'sick', 'haircut', 'long drive'];
notes.sort((a,b):number => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
});
let noteContainer = $('#notes');
let checks:HexCheck[] = [];
noteContainer.html('');
for (let note of notes) {
  let hc = new HexCheck(util.capitalize(note), false);
  checks.push(hc);
  noteContainer.append(hc.element);
}


// Dexter
var canvas = <HTMLCanvasElement> $('#dexter')[0];
var ctx = canvas.getContext('2d');
var dexter = new AnimationSheet('assets/emote.png', 'assets/emote.json');
dexter.colorize(150,150,180);
setInterval(function() {
  ctx.clearRect(0,0,15,15);
  dexter.draw(ctx, 0, 0, 15, 15);
}, 50);
//notify('Voice commands unavailable on this device');
setTimeout(function() {
  dexter.setAnimation('sleep');
  dexter.colorize(50,50,80);
}, 2000)