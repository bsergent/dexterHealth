import _ from 'lodash';
import moment from 'moment';
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
    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/foods/log/water/date/' + date.format('YYYY-MM-DD') + '.json',
      type: 'GET',
      //data: { content: 'testing test' },
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      return response.summary.water;
    });
  }
  async getWaterGoal() {
    let token = this.accessToken;
    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/foods/log/water/goal.json',
      type: 'GET',
      //data: { content: 'testing test' },
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      return response.goal.goal;
    });
  }

  // Food
  async getFood(date:moment.Moment) {
    let token = this.accessToken;
    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/foods/log/date/' + date.format('YYYY-MM-DD') + '.json',
      type: 'GET',
      //data: { content: 'testing test' },
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      return response.summary.calories;
    });
  }
  async getFoodGoal() {
    let token = this.accessToken;
    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/foods/log/goal.json',
      type: 'GET',
      //data: { content: 'testing test' },
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.setRequestHeader('Accept-Language', 'en_US');
      }
    }).then((response) => {
      return response.goals.calories;
    });
  }

  // Exercise
  async getExercise(date:moment.Moment) {
    let token = this.accessToken;
    return $.ajax({
      url: 'https://api.fitbit.com/1/user/-/activities/list.json?afterDate=' + date.format('YYYY-MM-DD') + '&offset=0&limit=20&sort=asc',
      type: 'GET',
      //data: { content: 'testing test' },
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