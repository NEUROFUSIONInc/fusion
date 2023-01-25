const {getTimeSeries} = require("./utils.js");
const fs = require("fs");
const dayjs = require('dayjs');

// READ THIS
// Put your refresh token into utils.js and you should be able to query your data.
// on the backend, we use the "source" activitywatch for screentime data
// other common sources are "apple"

let rangeOptions = {
  range: {
    end: dayjs().endOf('day'),
    start: dayjs().subtract(7, 'days').startOf('day')
  }
};  // This will take a longer time to return, you can use it to export data. Recommend writing data to files and downloading.

let daysInPastOptions = {
  daysInPast: 7 // get data for a week ago
}

// getTimeSeries('apple', rangeOptions).then(r => r && fs.writeFileSync('data_health.json', JSON.stringify(r)))
getTimeSeries('activitywatch', rangeOptions).then(r => r && fs.writeFileSync('data_activity.json', JSON.stringify(r)))



// hit me up at mike@magicflow.com if you have any questions!