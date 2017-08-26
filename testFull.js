var GlowDataFetcher = require('./GlowDataFetcher');

var GlowStorage = require('./GlowStorage');
var GlowUtils = require('./GlowUtils');

var credentials = GlowUtils.getSavedCredentials();
var g = new GlowDataFetcher(credentials.email, credentials.password, new GlowStorage({}));

g.fetchHowLongAwakeText(console.log);
g.fetchHowLongUnfedText(console.log);
