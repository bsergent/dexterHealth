import FitBit from 'fitbit';
import $ = require('jquery');
import * as moment from '../node_modules/moment/moment';

$('#date').text(moment().format('dddd, MMM. Do'));

var fitbit = new FitBit();
fitbit.getWater(moment()).then((current) => {
  fitbit.getWaterGoal().then((goal) => {
    console.log('Water:' + current + '/' + goal);
    $('#water').text('Water ' + current.toFixed(0) + '/' + goal.toFixed(0) + ' fl oz');
  });
});