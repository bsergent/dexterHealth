import $ = require('jquery');
import * as moment from '../node_modules/moment/moment';
import util = require('util');
import FitBit from 'FitBit';
import HexCheck from 'HexCheck';

$('#date').text(moment().format('dddd, MMM. Do'));

var fitbit = new FitBit();
fitbit.getWater(moment()).then((current) => {
  fitbit.getWaterGoal().then((goal) => {
    console.log('Water:' + current + '/' + goal);
    $('#water').text('Water ' + current.toFixed(0) + '/' + goal.toFixed(0) + ' fl oz');
  });
});

let notes: string[] = ['flow', 'VR', 'NyQuil', 'worship', 'work', 'class', 'social', 'sick', 'haircut'];
let noteContainer = $('#notes');
let checks:HexCheck[] = [];
noteContainer.html('');
for (let note of notes) {
  let hc = new HexCheck(util.capitalize(note), false);
  checks.push(hc);
  noteContainer.append(hc.element);
}