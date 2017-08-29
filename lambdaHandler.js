var Alexa = require('alexa-sdk');
var GlowDataFetcher = require('./GlowDataFetcher');
var GlowStorage = require('./GlowStorage');
var GlowUtils = require('./GlowUtils');

var credentials = GlowUtils.getSavedCredentials();

var handlers = {
  'AwakeTime': function() {
    console.log('here');
    console.log(this);
    console.log(this.attributes);
    var start = +new Date();
    var g = new GlowDataFetcher(
      credentials.email,
      credentials.password,
      new GlowStorage(this.attributes)
    );
    var intent = this.event.request.intent;
    var baby_name = intent.slots.BabyName.value;

    g.fetchHowLongAwakeText(
      text => {
        console.log((+new Date()) - start);
        var str = baby_name ? baby_name + " has been " : "";
        this.emit(':tell', str + " awake for " + text);
      }
    );
  },

  'FeedTime': function() {
    console.log(this);
    console.log(this.attributes);
    var g = new GlowDataFetcher(
      credentials.email,
      credentials.password,
      new GlowStorage(this.attributes)
    );
    var intent = this.event.request.intent;
    var baby_name = intent.slots.BabyName.value;

    g.fetchHowLongUnfedText(
      text => {
        var str = baby_name ? baby_name + " was" : "";
        this.emit(':tell', str + " last fed " + text + " ago");
      }
    );
  },

  'ClearCache': function() {
    for (var k in this.attributes) {
      delete this.attributes[k];
    }
    this.emit(':tell', 'Cache cleared');
  }
};

exports.handler = function(event, context, callback) {
  // When testing from aws command-line, fake the Alexa intent + handler stuff
  if (!event.session) {
    handlers[event.request.intent.name].apply({
      event: event,
      emit: function(command, str) {
        callback(null, str);
      },
      attributes: {}
    });
    return;
  }

  var alexa = Alexa.handler(event, context, callback);
  alexa.dynamoDBTableName = 'glow_skill';
  alexa.registerHandlers(handlers);
  alexa.execute();
};
