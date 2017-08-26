var GlowDataFetcher = require('../GlowDataFetcher');
var GlowStorage = require('../GlowStorage');
var fs = require('fs');
var GlowRawAPI = require('../GlowRawAPI');

var storage;
var g;

var injected_response = null;

var BABY_ID = 'test_baby_id';

var empty_response = {
  file_name: 'empty_sync.json',
  next_sync_token: 'empty_sync_token'
};

var cached_response = {
  file_name: 'cached_sync.json',
  next_sync_token: 'test_sync_token',
};

beforeEach(() => {
  storage = new GlowStorage({});
  g = new GlowDataFetcher('', '', storage);
  GlowRawAPI.fetchLoginToken = function(_, __, callback) {
    callback(JSON.parse(fs.readFileSync(__dirname + '/login_response.json')));
  };
  GlowRawAPI.fetchSyncData = function(_, __, ___, ____, callback) {
    callback(fs.readFileSync(__dirname + '/' + injected_response.file_name));
  };
});

test('it returns login token if in storage', done => { storage.setLoginToken('tok');

  function callback(loginToken) {
    expect(loginToken).toBe('tok');
    done();
  }
  g.fetchLoginToken(callback);
});

test('it fetches and stores login token if not in storage', done => {
  var _testLoginToken = 'test_encrypted_token';

  function callback(loginToken) {
    expect(loginToken).toBe(_testLoginToken);
    done();
  }

  g.fetchLoginToken(callback);

  expect(storage.getLoginToken()).toBe(_testLoginToken);
});

test('it fetches sync data', done => {
  storage.setLoginToken('tok');

  injectResponse(cached_response);

  g.fetchSyncData(done);

  expect(storage.getBabySyncToken()).toEqual(cached_response.next_sync_token);
  expect(storage.getBabyID()).toEqual(BABY_ID);
});

test('it fetches last wake time correctly from network', done => {
  storage.setLoginToken('tok');

  g.getCurrentDate = () => Date.parse("2017-01-02 2:01 PM");

  injectResponse(cached_response);

  function callback(data) {
    expect(data).toEqual({hours: 2, minutes: 1});
    done();
  }

  g.fetchHowLongAwake(callback);

  // Should also have last feed time cached after this
  expect(storage.getLastFeedTime()).toEqual(1483390800);
});

// This was a bug I had
test('it has feed time cached even if wake time called first', done => {
  storage.setLoginToken('tok');
  expect(storage.getLastFeedTime()).toBeFalsy();

  g.getCurrentDate = () => Date.parse("2017-01-02 2:01 PM");

  injectResponse(cached_response);

  g.fetchHowLongAwake(done);

  injectResponse(empty_response);

  function callback(data) {
    expect(data).toEqual({hours: 1, minutes: 1});
    done();
  }

  g.fetchHowLongUnfed(callback);
});

test('it fetches last wake time correctly from cache if no new data', done => {
  storage
    .setLoginToken('tok')
    .setLastWakeTime(1234);

  injectResponse(empty_response);

  g.fetchHowLongAwake(done);

  expect(storage.getBabySyncToken()).toEqual(empty_response.next_sync_token);

  expect(storage.getLastWakeTime()).toEqual(1234);
});

test('it uses new value instead of cache if newer data', done => {
  storage
    .setLoginToken('tok')
    .setLastFeedTime(1234)
    .setLastWakeTime(1234);

  injectResponse(cached_response);

  g.fetchHowLongAwake(done);

  expect(storage.getLastWakeTime()).toEqual(1483387200);
});

function injectResponse(response) {
  injected_response = response;
}

function _test() {} // for temporarily disabling tests
