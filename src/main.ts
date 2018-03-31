import $ from 'jquery';
import moment from 'moment';
import util = require('./util');
import FitBit from './FitBit';
import HexCheck from './HexCheck';
import Note from './Note';
import AnimationSheet from './lib/AnimationSheet';
import firebase from 'firebase';

// TODO Add method to import data from Sleep Cycle .csv
// TODO Make note handling more robust
// TODO Add quick overview of the last month of quality of life data as a minimal line graph
// TODO Add method of notes?
// TODO Add Toggl integration, probably one of their fancy pie charts below notes, and have it auto-populate the notes section

interface HexCheckDictionary {
  [label: string]: HexCheck
}
interface Entry {
  quality: number,
  summary: string,
  notes: Array<SimpleNote>
}
interface SimpleNote {
  label: string,
  type?: string,
  value?: any
}

let config = {
  apiKey: "AIzaSyDaPqsTZiub_fDnPxyslU4d9KS0Rdgd0cA",
  authDomain: "dexterhealth-81038.firebaseapp.com",
  databaseURL: "https://dexterhealth-81038.firebaseio.com",
  projectId: "dexterhealth-81038",
  messagingSenderId: "1027460935212"
}
let fire = <firebase.app.App>(firebase as any).firebase.initializeApp(config);

function unlock(firebasePassword: string): void {
// Firebase
var noteDictionary:Note[] = [];
// Authentication (bsergentv@gmail.com,electricWater)
fire.auth().signInWithEmailAndPassword('bsergentv@gmail.com', firebasePassword).then(() => {
  $('#unlock').addClass('success');
  setDate(moment().subtract(5, 'hour')); // Start the next day at 5am
  // Load notes and update them continuously
  currentPageReference = fire.database().ref('/' + selectedDate.format('YYYY-MM-DD')) as firebase.database.Reference;
  currentPageReference.on('value', firebasePageUpdate);
  $('#cover').removeClass('visible');
}).catch(ex => {
  $('#unlock').addClass('failure');
  setTimeout(e => { $('#unlock').removeClass('failure'); }, 500);
  notify('[Firebase] ' + ex.message);
});

function firebasePageUpdate(snapshot: any): void {
  let entry = snapshot.val() as Entry;
  if (entry === null) {
    if (selectedDate.format('YYYY-MM-DD') === moment().subtract(5, 'hour').format('YYYY-MM-DD')) {
      // Only create new entries for the current day
      initializeEntry();
      return;
    } else {
      // Display blank page for days without entries
      entry = {
        summary: 'No entry found.',
        quality: -1,
        notes: []
      }
      // TODO Show an initialize entry button
    }
  }
  let summaryContainer = $('#summary');
  if (!summaryContainer.is(':focus'))
    summaryContainer.val(entry.summary);
  summaryContainer.on('keyup', (event) => { fire.database().ref(`/${selectedDate.format('YYYY-MM-DD')}/summary`).set(summaryContainer.val()); });
  setQuality(entry.quality);
  if (entry.notes === undefined) entry.notes = [];
  for (let n = 0; n < entry.notes.length; n++) {
    let note = entry.notes[n];
    if (note.value === undefined) note.value = true;
    if (note.type === undefined) note.type = typeof note.value;
    if (noteDictionary[note.label.toLowerCase()] === undefined) {
      // Add new entry
      let newNote = new Note(note.label,
        note.type,
        note.value,
        fire.database().ref(`/${selectedDate.format('YYYY-MM-DD')}/notes/${n}/value`)
      );
      noteDictionary[note.label.toLowerCase()] = newNote;
    } else {
      // Update existing entry
      noteDictionary[note.label.toLowerCase()].value = note.value;
    }
  }
  updateNoteContainer();
}

function initializeEntry(): void {
  console.log('Initializing entry...');
  let defaultNotes: SimpleNote[] = [
    {
      label: 'DnD',
      type: 'boolean',
      value: false
    },
    {
      label: 'Flow',
      type: 'boolean',
      value: false
    },
    {
      label: 'VR',
      type: 'boolean',
      value: false
    },
    {
      label: 'NyQuil',
      type: 'boolean',
      value: false
    },
    {
      label: 'Worship',
      type: 'boolean',
      value: false
    },
    {
      label: 'Work',
      type: 'enum:OSIsoft,Halls Cinema 7',
      value: ''
    },
    {
      label: 'Class',
      type: 'boolean',
      value: false
    },
    {
      label: 'Social',
      type: 'boolean',
      value: false
    },
    {
      label: 'Sick',
      type: 'boolean',
      value: false
    },
    {
      label: 'Haircut',
      type: 'boolean',
      value: false
    },
    {
      label: 'Long drive',
      type: 'boolean',
      value: false
    },
    {
      label: 'Piano',
      type: 'boolean',
      value: false
    },
    {
      label: 'Guitar',
      type: 'boolean',
      value: false
    },
    {
      label: 'Bike',
      type: 'boolean',
      value: false
    },
    {
      label: 'Gym',
      type: 'boolean',
      value: false
    }
  ];
  defaultNotes = defaultNotes.sort((x,y) => {
    return x.label.toLowerCase().localeCompare(y.label.toLowerCase());
  });
  fire.database().ref('/' + selectedDate.format('YYYY-MM-DD')).set({
    summary: 'None',
    quality: -1,
    notes: defaultNotes
  });
}

function setQuality(quality: number): void {
  let html = '<div class="row"><div class="col-xs-7">';
  for (let i = 1; i <= 5; i++)
    html += `<img id="quality_${i}" src="assets/hex_${ i <= quality ? 'full' : 'empty' }.png" width="24px" /> `;
  html += '</div><div class="col-xs-5 description">';
  switch (quality) {
    case 1:
    html += 'Awful';
      break;
    case 2:
    html += 'Stressful'; // Stressful in Sleep Cycle
      break;
    case 3:
    html += 'Okay'; // Nothing in Sleep Cycle
      break;
    case 4:
    html += 'Good'; // Good in Sleep Cycle
      break;
    case 5:
    html += 'Fantastic'; // Great in Sleep Cycle
      break;
    default:
      html += 'Unknown';
      break;
  }
  html += '</div></div>';
  $('#quality').html(html);

  // Update listeners
  for (let i = 1; i <= 5; i++) {
    $('#quality_' + i).click(e => {
      fire.database().ref(`/${selectedDate.format('YYYY-MM-DD')}/quality`).set(i);
    });
  }
}
// FitBit
var fitbit = null;

var selectedDate: moment.Moment = null;
var currentPageReference: firebase.database.Reference = null;
function setDate(newDate: moment.Moment) {
  // Prevent future dates
  if (newDate > moment().subtract(5, 'hour'))
    newDate = moment().subtract(5, 'hour');

  if (fitbit === null)
    fitbit = new FitBit();
  
  // Change selected page
  if (selectedDate !== null)
    fire.database().ref('/' + selectedDate.format('YYYY-MM-DD')).off('value');
  selectedDate = newDate;
  if (selectedDate.format('YYYY-MM-DD') === moment().subtract(5, 'hour').format('YYYY-MM-DD'))
    $('#date').text('Today, ' + selectedDate.format('dddd'));
  else
    $('#date').text(selectedDate.format('dddd, MMM. Do'));
  if (newDate > moment().subtract(5 + 24, 'hour')) $('#page-right').addClass('disabled');
  else $('#page-right').removeClass('disabled');

  // Update FitBit
  fitbit.getWater(selectedDate.clone()).then((current) => {
    fitbit.getWaterGoal().then((goal) => {
      console.log('Water:' + current.toFixed(0) + '/' + goal.toFixed(0));
      let maxHeight = $('#water .icon').height();
      let $water = $('#water .icon > div:first-child');
      $water.css('height', Math.min(current / goal * maxHeight, maxHeight).toFixed(0) + 'px');
    });
  }).catch(ex => { notify('[FitBit] Failed to fetch water.'); console.error(ex); });

  fitbit.getFood(selectedDate.clone()).then((current) => {
    fitbit.getFoodGoal().then((goal) => {
      console.log('Food:' + current.toFixed(0) + '/' + goal.toFixed(0));
      let maxHeight = $('#food .icon').height();
      let $food = $('#food .icon > div:first-child');
      $food.css('height', Math.min(current / goal * maxHeight, maxHeight).toFixed(0) + 'px');
    });
  }).catch(ex => { notify('[FitBit] Failed to fetch food.'); });

  fitbit.getExercise(selectedDate.clone().startOf('isoWeek')).then((response:any) => {
    console.log('Exercise:' + response.current.toFixed(0) + '/' + response.goal.toFixed(0));
    let maxHeight = $('#exercise .icon').height();
    let $exercise = $('#exercise .icon > div:first-child');
    $exercise.css('height', Math.min(response.current / response.goal * maxHeight, maxHeight).toFixed(0) + 'px');
  }).catch(ex => { notify('[FitBit] Failed to fetch exercise.'); });

  // Update weather
  // TODO Save current weather data to Firebase
  // Use https://openweathermap.org/ for current data
  

  // Update firebase
  if (currentPageReference !== null) {
    noteDictionary = [];
    currentPageReference.off('value');
    currentPageReference = fire.database().ref('/' + selectedDate.format('YYYY-MM-DD')) as firebase.database.Reference;
    currentPageReference.on('value', firebasePageUpdate);
  }
}

// UI
$('#page-left').click(function () { setDate(selectedDate.clone().subtract(1, 'day')); });
$('#date').click(function () { setDate(moment().subtract(5, 'hour')); });
$('#page-right').click(function () { if (!$('#page-right').hasClass('disabled')) setDate(selectedDate.clone().add(1, 'day')); });

/*function updateFirebaseNoteOrder():boolean {
  let newNoteArray = [];
  for (let key of Object.keys(noteDictionary)) {
    newNoteArray.push(noteDictionary[key].export());
  }
  // Add defaults
  // TODO Only add default notes to new current date, don't retroactively add inaccurate data to previous entries
  for (let defaultNote of defaultNotes) {
    if (newNoteArray.find((n:SimpleNote) => { return n.label.toLowerCase() === defaultNote.label.toLowerCase(); }) !== null) {
      newNoteArray.push(defaultNote);
    }
  }
  // Sort
  newNoteArray = newNoteArray.sort((x,y) => {
    return x.label.toLowerCase().localeCompare(y.label.toLowerCase());
  });
  // Push
  let changed = newNoteArray.length !== noteDictionary.length;
  console.log(changed);
  if (changed) fire.database()
    .ref('/' + selectedDate.format('YYYY-MM-DD') + '/notes/')
    .set(newNoteArray);
  return changed;
}*/

function updateNoteContainer(): void {
  let container = $('#notes');
  container.html('');
  for (let key of Object.keys(noteDictionary)
      .sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); }))
    container.append(noteDictionary[key].element);
}

let notificationTimeoutId: number;
function notify(message: string): void {
  console.log(message);
  let notif = $('#notif');
  notif.text(message);
  notif.addClass('visible');
  clearTimeout(notificationTimeoutId);
  notificationTimeoutId = setTimeout(function () {
    notif.removeClass('visible');
  }, 4000);
}

}

let storedPass = window.localStorage.getItem('firebasePassword');
$('#firebasePassword').val(storedPass);
if (storedPass !== null && storedPass !== '') unlock(storedPass);
$('#unlock').click(e => {
  let pass = $('#firebasePassword').val() as string;
  window.localStorage.setItem('firebasePassword', pass);
  unlock(pass);
});
$('#firebasePassword').keypress(e => {
  if (e.which !== 13) return;
  let pass = $('#firebasePassword').val() as string;
  window.localStorage.setItem('firebasePassword', pass);
  unlock(pass);
});
$('#lock').click(e => {
  window.localStorage.setItem('firebasePassword', '');
  $('#firebasePassword').val('');
  $('#cover').addClass('visible');
  $('#unlock').removeClass('success');
  fire.auth().signOut();
  $('#quality').html('');
  $('#summary').html('');
  $('#notes').html('');
});

/*// Dexter
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
}, 2000);*/