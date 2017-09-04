import $ from 'jquery';
import moment from 'moment';
import util = require('./util');
import FitBit from './FitBit';
import HexCheck from './HexCheck';
import AnimationSheet from './lib/AnimationSheet';
import firebase from 'firebase';

interface HexCheckDictionary {
  [label:string]:HexCheck
}

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
let notes: string[] = ['flow', 'VR', 'NyQuil', 'worship', 'work', 'class', 'social', 'sick', 'haircut', 'long drive', 'piano', 'guitar'];
notes.sort((a,b):number => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
});
let noteContainer = $('#notes');
noteContainer.html('');
let checks:HexCheckDictionary = {};
for (let note of notes) {
  let hc = new HexCheck(util.capitalize(note), false);
  checks[note] = hc;
  noteContainer.append(hc.element);
}


// Firebase
let config = {
  apiKey: "AIzaSyDaPqsTZiub_fDnPxyslU4d9KS0Rdgd0cA",
  authDomain: "dexterhealth-81038.firebaseapp.com",
  databaseURL: "https://dexterhealth-81038.firebaseio.com",
  projectId: "dexterhealth-81038",
  storageBucket: "",
  messagingSenderId: "1027460935212"
}
let fire = <firebase.app.App>(firebase as any).firebase.initializeApp(config); // This is all I can get to work...
// Load notes and update them continuously
fire.database().ref(selectedDate.format('YYYY-MM-DD')).on('value', function(snapshot:any) {
  console.log(snapshot);
  for (let note of snapshot.notes) {
    checks[note.label].state = note.value;
  }
});


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
}, 2000);