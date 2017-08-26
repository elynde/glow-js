"use strict";
var fs = require('fs');

class GlowUtils {
  static durationToText(hours, minutes) {
    var hour_string = '';
    var minute_string = '';
    var str;

    if (hours == 1) {
      hour_string = '1 hour';
    } else if (hours > 1) {
      hour_string = hours + ' hours';
    }

    if (minutes == 1) {
      minute_string = '1 minute';
    } else if (minutes > 1) {
      minute_string = minutes + ' minutes';
    }

    if (hour_string.length && minute_string.length) {
      str = hour_string + ' and ' + minute_string;
    } else {
      str = hour_string + minute_string;
    }

		return str;
  }

  static getSavedCredentials() {
    return JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  }
}

module.exports = GlowUtils;
