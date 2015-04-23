var request = require('request'),
    user = require('./user');

var baseUrl = 'http://vaas.acapela-group.com/Services/Synthesizer'

//TODO set keys
var username = ""
var password = ""
var login = ""

var Acapela = {}

Acapela.fetchAudio = function(writestream, options, response) {

    user.getCredentialsById(options.askId, function(err, obj) {

        login = obj.login
        username = obj.username
        password = obj.password

        var reqOptions = {
            headers: {
                "User-Agent": "AskFastAudioGateway/1.0",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            url: baseUrl,
            form: {
                cl_login: login,
                cl_app: username,
                cl_pwd: password,
                req_voice: options.voice,
                req_text: encodeURI(options.text),
                req_snd_type: options.codec.toUpperCase()
            }
        };

        request.post(reqOptions, function(error, response, body) {
            //convenrt resposne string to json object
            var parsedRes = JSON.parse('{"' + decodeURI(body.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');

            var x = request.get({
                headers: {
                    "User-Agent": "AskFastAudioGateway/1.0"
                },
                url: parsedRes.snd_url
            }).on('response', function parseFetchAudioResponse(res) {
                if (res.headers['content-type'].indexOf('audio/x-wav') < -1 || res.headers['content-type'].indexOf('audio/wav') < -1) {
                    console.log('wrong content-type : ' + res.headers['content-type'])
                    res.on('error', function() {
                        console.log('No audio fetched. Returning default audio');
                        response.redirect('/audio/ttsFail.wav');
                    })
                } else {
                    x.pipe(writestream);
                }
            });
        })
    })
}

module.exports = Acapela;