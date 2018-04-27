import _ from 'lodash';
import moment from 'moment';

// TODO Cache results from previous dates to prevent too many API calls

interface Water {
  current:number,
  goal:number
}
interface Food {
  current:number,
  goal:number
}

export default class FitBit {
  private accessToken:string;
  private cache = new Map<string,number>();
  constructor() {
    if (!window.location.hash) {
      window.location.replace('https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=228LJG&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep');
    } else {
      let urlParams:any = {};
      window.location.hash.slice(1).replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function replacer($0, $1, $2, $3):string {
          urlParams[$1] = $3;
          return '';
        }
      );
      this.accessToken = urlParams['access_token'];
      console.log('Connected to FitBit');
    }
  }

  // Water
  async getWater(date:moment.Moment) {
    let token = this.accessToken;
    let dateString = date.format('YYYY-MM-DD');
    // Always update latest date since it's likely to update
    if (dateString !== moment().subtract(5, 'hour').format('YYYY-MM-DD') && this.cache.has(`water-${dateString}`))
      return new Promise<number>((resolve) => { resolve(this.cache.get(`water-${dateString}`)); });

    let request = `https://api.fitbit.com/1/user/-/foods/log/water/date/${dateString}.json`;
    return $.ajax({
      url: request,
      type: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      this.cache.set(`water-${dateString}`, response.summary.water);
      return response.summary.water;
    });
  }
  async getWaterGoal() {
    let token = this.accessToken;
    if (this.cache.has('water-goal'))
      return new Promise<number>((resolve) => { resolve(this.cache.get('water-goal')); });

    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/foods/log/water/goal.json',
      type: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      this.cache.set(`water-goal`, response.goal.goal);
      return response.goal.goal;
    });
  }

  // Food
  async getFood(date:moment.Moment) {
    let token = this.accessToken;
    let dateString = date.format('YYYY-MM-DD');
    if (dateString !== moment().subtract(5, 'hour').format('YYYY-MM-DD') && this.cache.has(`food-${dateString}`))
      return new Promise<number>((resolve) => { resolve(this.cache.get(`food-${dateString}`)); });

    return $.ajax({
      url: `https://api.fitbit.com/1/user/-/foods/log/date/${dateString}.json`,
      type: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      this.cache.set(`food-${dateString}`, response.summary.calories);
      return response.summary.calories;
    });
  }
  async getFoodGoal() {
    let token = this.accessToken;
    if (this.cache.has('food-goal'))
      return new Promise<number>((resolve) => { resolve(this.cache.get('food-goal')); });

    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/foods/log/goal.json',
      type: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      this.cache.set(`food-goal`, response.goals.calories);
      return response.goals.calories;
    });
  }

  // Exercise
  async getExercise(date:moment.Moment) {
    let token = this.accessToken;
    // TODO Don't requery if already logged activity for today
    // TODO API doesn't allow before and after dates, so find a work around to only show exercise for the current week
    //  beforeDate=${date.add(7, 'days').format('YYYY-MM-DD')}
    return $.ajax({
      url: `https://api.fitbit.com/1/user/-/activities/list.json?afterDate=${date.format('YYYY-MM-DD')}&offset=0&limit=20&sort=asc`,
      type: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      let groupedActivities = _.groupBy(response.activities, (act:any) => {
        return moment(act.startTime).format('ddd YYYY-MM-DD');
      });
      return {
        current: Object.keys(groupedActivities).length,
        goal: 4
      };
    });
  }
}