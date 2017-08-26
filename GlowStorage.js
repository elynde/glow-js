"use strict";

class GlowStorage {
  constructor(store) {
    this.store = store;
  }

  setLoginToken(loginToken) {
    this.store['loginToken'] = loginToken;
    return this;
  }

  getLoginToken() {
    return this.store['loginToken'];
  }

  setBabyID(baby_id) {
    this.store['babyID'] = baby_id;
    return this;
  }

  getBabyID() {
    return this.store['babyID'];
  }

  setBabySyncToken(sync_token) {
    this.store['babySyncToken'] = sync_token;
    return this;
  }

  getBabySyncToken() {
    return this.store['babySyncToken'];
  }

  setUserSyncToken(sync_token) {
    this.store['userSyncToken'] = sync_token;
    return this;
  }

  getUserSyncToken() {
    return this.store['userSyncToken'];
  }

  setLastFeedTime(last_feed_time) {
    this.store['lastFeedTime'] = last_feed_time;
    return this;
  }

  getLastFeedTime(last_feed_time) {
    return this.store['lastFeedTime'] || 0;
  }

  setLastWakeTime(last_wake_time) {
    this.store['lastWakeTime'] = last_wake_time;
    return this;
  }

  getLastWakeTime(last_wake_time) {
    return this.store['lastWakeTime'] || 0;
  }

  setLastResponse(response) {
    this.store['lastResponse'] = response;
    return this;
  }

  getLastResponse() {
    return this.store['lastResponse'];
  }
}

module.exports = GlowStorage;
