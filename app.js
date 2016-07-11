var Botkit = require('botkit');
var os = require('os');
var util = require('util');
var restHelper = require('request');
var helper = require('./helper/helper.js');
const crypto = require('crypto');

const weatherAPIKey = '[forcast.io api key]';
const gmapsAPIKey = '[google maps api key]';

var googleMapsAPI = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var forcastAPI = "https://api.forecast.io/forecast/" + weatherAPIKey + "/";
var controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: "[slack api token]"
}).startRTM();

controller.hears(['format (.*)', 'json (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var jsontext = message.match[1];
    var formattedJson = JSON.stringify(jsontext);
    bot.reply(message, 'Input JSON: ' + jsontext + '\n Formatted JSON: ' + formattedJson);
});

controller.hears(['hash (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var inputString = message.match[1];
    console.log(inputString);

    if (inputString != null) {
        var hash = crypto.createHash('sha256').update(inputString, 'utf8').digest('hex');
        bot.reply(message, 'Input String: ' + inputString + '\n Hash String: ' + hash);
    }
    else {
        bot.reply(message, 'To generate hash for string send "hash <string>"');
    }

});

controller.hears(['location (.*)', 'latlng (.*)', 'convert (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var city = message.match[1];
    var mapsApiToCall = googleMapsAPI + city + "&key=" + gmapsAPIKey;
    restHelper(mapsApiToCall, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var geocodeData = JSON.parse(body);
            if (geocodeData.status == "OK") {
                var formattedAddress = geocodeData.results[0].formatted_address;
                var lat = geocodeData.results[0].geometry.location.lat;
                var lng = geocodeData.results[0].geometry.location.lng;
                bot.reply(message, formattedAddress + "\n Lat: " + lat + ", Lng: " + lng); // Show the HTML for the Modulus homepage.
            }
           else{
                bot.reply(message, "Google Returned:"+geocodeData.status);
            }
        }
        else {
            bot.reply(message, "Error processing data.");
        }
    });
});

controller.hears(['weather (.*)', 'temperature (.*)', 'temp (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {

    var city = message.match[1];
    var mapsApiToCall = googleMapsAPI + city + "&key=" + gmapsAPIKey;

    restHelper(mapsApiToCall, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var geocodeData = JSON.parse(body);
            if (geocodeData.status == "OK") {
                var formattedAddress = geocodeData.results[0].formatted_address;
                var lat = geocodeData.results[0].geometry.location.lat;
                var lng = geocodeData.results[0].geometry.location.lng;
                bot.reply(message, formattedAddress + "\n Lat: " + lat + ", Lng: " + lng); // Show the HTML for the Modulus homepage.

                var forcastApiToCall = forcastAPI + lat + "," + lng + "?units=si&exclude=minutely,hourly,daily,flags";
                restHelper(forcastApiToCall, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var forcastData = JSON.parse(body);

                        var messageToSend = "Temperature : " + forcastData.currently.temperature + " *C (" + forcastData.currently.summary + ") \n with wind speed of " + forcastData.currently.windSpeed + " kmph";
                        bot.reply(message, messageToSend); // Show the HTML for the Modulus homepage.
                    }
                    else {
                        bot.reply(message, "Error processing data.");
                    }
                });
            }
            else{
                bot.reply(message, "Google Returned:"+geocodeData.status);
            }

        }
        else {
            bot.reply(message, "Error processing data.");
        }
    });
});

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function (err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    
    bot.reply(message, 'Hello.');
});

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function () {
                        process.exit();
                    }, 3000);
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function (response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
        ]);
    });
});

controller.hears(['uptime'], 'direct_message,direct_mention,mention', function (bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,
        ':robot_face: I am a bot named <@' + bot.identity.name +
        '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

//Sample Code

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}