var request = require('request'),
    logger = require('./utils/logger');

var baseUrl = 'http://api.voicerss.org/?';

var KEYS = ["", ""];

var Voicerss = {}

Voicerss.fetchAudio = function(writestream, options, keyIndex, response, users) {
    //build request url
    var urlWithoutKey = baseUrl;
    urlWithoutKey += 'hl=' + options.language;
    urlWithoutKey += '&c=' + options.codec;
    urlWithoutKey += '&f=' + options.format;
    urlWithoutKey += '&src=' + options.text;

    var key = KEYS[keyIndex];
    if (users && users.length > keyIndex && users[keyIndex].properties && users[keyIndex].properties.key) {
        key = users[keyIndex].properties.key;
    }
    var urlWithKey = urlWithoutKey + '&key=' + key;
    console.log('urlWithKey: ' + urlWithKey);

    var x = request.get({
        headers: {
            "User-Agent": "AskFastAudioGateway/1.0"
        },
        url: urlWithKey
    }).on('response', function parseFetchAudioResponse(res) {
        // Make sure only audio files get stored
        if (res.headers['content-type'].indexOf('audio/wav') == -1) {
            res.on('data', function(chunk) {
                console.log('Audio not fetched with Key: ' + key + ' and Index: ' + keyIndex + '. Response is: ' + chunk);
            });
            if (keyIndex < KEYS.length - 1) {
                logger.info('use new key');
                Voicerss.fetchAudio(writestream, options, ++keyIndex, response, users);
            } else {
                //play a default message when tts failed!
                logger.severe('No audio fetched. Returning default audio');
                response.redirect('/audio/ttsFail.wav');
            }
        } else {
            //leave a default message that no TTS is fetched.
            x.pipe(writestream);
        }
    });
}

module.exports = Voicerss;