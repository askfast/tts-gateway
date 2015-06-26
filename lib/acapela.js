var request = require('request'),
    qs = require('querystring'),
    logger = require('./utils/logger');

var baseUrl = 'http://vaas.acapela-group.com/Services/Synthesizer'
//TODO set keys
var username = ""
var password = ""
var login = ""

var Acapela = {}

Acapela.fetchAudio = function(writestream, options, resp, user) {

    if (user) {
        login = user.properties && user.properties.login ? user.properties.login : login;
        username = user.username ? user.username : username;
        password = user.password ? user.password : password;
    }

    logger.info('credentials used: login: ' + login + ' username: ' + username + ' password: ' + password);

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
        var parsedRes = qs.parse(body);

        if (parsedRes.res == "OK") {

            var x = request.get({
                headers: {
                    "User-Agent": "AskFastAudioGateway/1.0"
                },
                url: parsedRes.snd_url
            }).on('response', function parseFetchAudioResponse(res) {
                if (res.headers['content-type'].indexOf('audio/x-wav') < -1 || res.headers['content-type'].indexOf('audio/wav') < -1) {
                    logger.error('wrong content-type : ' + res.headers['content-type'])
                    res.on('error', function (err) {
                        logger.error('No audio fetched. Returning default audio, err: ',err);
                        resp.redirect('/audio/ttsFail.wav');
                    })
                } else {
                    x.pipe(writestream);
                }
            });

        } else {
            logger.error('No audio fetched. Returning default audio, err: ',parsedRes);
            resp.redirect('/audio/ttsFail.wav');
        }
    });
}

module.exports = Acapela;