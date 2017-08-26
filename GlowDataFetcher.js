"use strict";
var https = require('https');
var fs = require('fs');
var moment = require('moment');

var GlowUtils = require('./GlowUtils');

var GlowRawAPI = require('./GlowRawAPI');

class GlowDataFetcher {
  constructor(email, password, storage) {
    this.email = email;
    this.password = password;
    this.storage = storage;
  }

  fetchLoginToken(callback) {
    if (this.storage.getLoginToken()) {
      callback(this.storage.getLoginToken());
      return;
    }

    GlowRawAPI.fetchLoginToken(
      this.email,
      this.password,
      response => {
        var token = response.data.user.encrypted_token;
        this.storage.setLoginToken(token);
        callback(token);
      }
    );
  }

  fetchSyncData(callback) {
    var baby_sync_token = this.storage.getBabySyncToken();
    var user_sync_token = this.storage.getUserSyncToken();
    var baby_id = this.storage.getBabyID();

    this.fetchLoginToken(login_token => {
      GlowRawAPI.fetchSyncData(
        login_token,
        baby_sync_token,
        user_sync_token,
        baby_id,
        data => {
          var parsed = JSON.parse(data);
          if (parsed.msg) {
            console.log('ERRRRRRR');
            return;
          }
          // Only support one baby for now
          var baby_data = parsed.data.babies[0];

          this.storage.setBabySyncToken(baby_data.sync_token);
          this.storage.setUserSyncToken(parsed.data.user.sync_token);
          this.storage.setBabyID(baby_data['baby_id']);

          var last_feed_time = Math.max(
            this._getLastFeedTimeInResponse(parsed),
            this.storage.getLastFeedTime()
          );

          var last_sleep_time = Math.max(
            this._getLastSleepTimeInResponse(parsed),
            this.storage.getLastWakeTime()
          );

          this.storage.setLastWakeTime(last_sleep_time);
          this.storage.setLastFeedTime(last_feed_time);

          callback({
            last_feed_time: last_feed_time,
            last_sleep_time: last_sleep_time,
          });
        }
      );
    });
  }

  fetchLatestSleepEntry(callback) {
    this.fetchSyncData(data => callback(data.last_sleep_time));
  }

  fetchLatestFeedEntry(callback) {
    this.fetchSyncData(data => callback(data.last_feed_time));
  }

  _getLastFeedTimeInResponse(response) {
    var updates = response.data.babies[0].BabyFeedData.update;

    if (!updates) {
      return -1;
    }

    var newest = -1;
    for (var i = 0; i < updates.length; i++) {
      var update = updates[i];
      // 1-4 are breast or bottle, 5/6 seem to be pumping
      if (update.feed_type < 5 && update.start_timestamp > newest) {
        newest = update.start_timestamp;
      }
    }

    return newest;
  }

  _getLastSleepTimeInResponse(response) {
    var baby_data = response.data.babies[0].BabyData;
    var updates = baby_data.update;
    if (!updates) {
      return -1;
    }
    var newest = -1;
    for (var i = 0; i < updates.length; i++) {
      var update = updates[i];
      if (update.key == 'sleep' && update.end_timestamp > newest) {
        newest = update.end_timestamp;
      }
    }

    return newest;
  }

  fetchHowLongAwake(callback) {
    this.fetchLatestSleepEntry(
      entry => {
        // No new entry, use cache
        if (entry == -1) {
          entry = this.storage.getLastWakeTime();
        }

        var end = moment(entry*1000);
        var now = moment(this.getCurrentDate());
        var hours = now.diff(end, 'hours', true);
        var minutes = (hours % 1)*60;

        callback({
          hours: Math.floor(hours),
          minutes: Math.round(minutes)
        });
      }
    );
  }

  fetchHowLongUnfed(callback) {
    this.fetchLatestFeedEntry(
      entry => {
        // No new entry, use cache
        if (entry == -1) {
          entry = this.storage.getLastFeedTime();
        }

        var end = moment(entry*1000);
        var now = moment(this.getCurrentDate());
        var hours = now.diff(end, 'hours', true);
        var minutes = (hours % 1)*60;

        callback({
          hours: Math.floor(hours),
          minutes: Math.round(minutes)
        });
      }
    );
  }

  fetchHowLongAwakeText(callback) {
    this.fetchHowLongAwake(
      how_long => {
        callback(GlowUtils.durationToText(how_long.hours, how_long.minutes));
      }
    );
    return this;
  }

  fetchHowLongUnfedText(callback) {
    this.fetchHowLongUnfed(
      how_long => {
        callback(GlowUtils.durationToText(how_long.hours, how_long.minutes));
      }
    );
  }

  // For hardcoding time in tests
  getCurrentDate() {
    return new Date();
  }
}

module.exports = GlowDataFetcher;
