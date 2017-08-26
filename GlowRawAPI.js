"use strict";
var https = require('https');

class GlowRawAPI {
  static fetchLoginToken(email, password, callback) {
    var options = {
      host: 'baby.glowing.com',
      path: '/android/user/sign_in',
      method: 'POST'
    };
    var req = https.request(options, response => {
      var body = '';
      response.on('data', d => {
        body += d;
      });
      response.on('end', () => {
        var parsed = JSON.parse(body);
        if (parsed.msg) {
          console.log("ERROR");
          console.log(body);
          return;
        }
        callback(parsed);
      });
    });

    req.write(JSON.stringify({email: email, password: password}))
    req.end();
  }

  static fetchSyncData(login_token, baby_sync_token, user_sync_token, baby_id, callback) {
    // Stuff I copied from the Android app
    var headers = {
      'GlowOccurTime': '1501282746855',
      'Request-Id': '559aaae19e0b1535-1501282746855',
      'Authorization': login_token,
      'Content-Type': 'application/json; charset=utf-8',
      'Host': 'baby.glowing.com',
      'User-Agent': 'okhttp/3.4.1'
    };

    var babies = [];
    var user = {};
    if (baby_id && baby_sync_token) {
      babies = [{sync_token: baby_sync_token, baby_id: baby_id}];
    }

    if (user_sync_token) {
      user.sync_token = user_sync_token;
    }

    var dataString = JSON.stringify({
      data: {
        babies: babies,
        user: user
      }
    });

    var options = {
      path: 'https://baby.glowing.com/android/user/pull?hl=en_US&random=7645523890115&device_id=79906fb6942e9c92&android_version=1.7.4&vc=10704&tz=America/New_York&code_name=noah',
      host: 'baby.glowing.com',
      method: 'POST',
      headers: headers,
    };

    var req = https.request(options, function(response) {
      var body = '';
      response.on('data', function(d) {
          body += d;
      });
      response.on('end', function() {
        callback(body);
      });
      response.on('error', function() {
        console.log('errrrrr');
      });
    });

    req.write(dataString);
    req.on('error', function(e) {
      console.log(e);
    });
    req.end();

  }
}

module.exports = GlowRawAPI;
