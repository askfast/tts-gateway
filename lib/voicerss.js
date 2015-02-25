var request = require('request');

var baseUrl = 'http://api.voicerss.org/?';

var KEYS = ["",""];

var Voicerss = {}

Voicerss.fetchAudio = function(writestream, options, keyIndex, response) {
	//build request url
    var urlWithoutKey = baseUrl;
    urlWithoutKey += 'hl='+options.language;
    urlWithoutKey += '&c='+options.codec;
    urlWithoutKey += '&f='+options.format;
    urlWithoutKey += '&src='+options.text;

    console.log('urlWithoutKey: ' + urlWithoutKey + ' keyIndex: '+ keyIndex);

    var urlWithKey = urlWithoutKey + '&key='+ KEYS[keyIndex];
    var x = request.get({headers: { "User-Agent": "AskFastAudioGateway/1.0"}, url: urlWithKey}).on('response', function parseFetchAudioResponse(res) {
                // Make sure only audio files get stored
                if(res.headers['content-type'].indexOf('audio/wav')==-1) {
                    res.on('data', function(chunk) {
                     console.log('Audio not fetched with Key: ' + KEYS[keyIndex] + ' and Index: '+ keyIndex + '. Response is: ' + chunk );
                    });
                    if(keyIndex < KEYS.length - 1) {
                        console.log('use new key');
                        fetchAudio(writestream, urlWithoutKey, ++keyIndex, response);
                    }
                    else {
                            //play a default message when tts failed!
                            console.log('No audio fetched. Returning default audio' );
                            response.redirect('/audio/ttsFail.wav');
                    }
                } else {
                    //leave a default message that no TTS is fetched.
                    x.pipe(writestream);
                }
            });
}

module.exports = Voicerss;