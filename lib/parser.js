/**
 * Created by Sven Stam on 30-05-14.
 */
var mongo = require('mongodb'),
    Db = mongo.Db,
    request = require('request'),
    Grid = require('gridfs-stream'),
    crypto = require('crypto'),
    voicerss = require('./voicerss'),
    acapela = require('./acapela'),
    user = require('./user'),
    logger = require('./utils/logger');

var Parser = {};

var dbName = "tts-cache"
var db;
Db.connect("mongodb://localhost:27017/" + dbName, function(err, database) {
    if (err) return console.dir(err);

    db = database;
});

Parser.parse = function(req, res, next) {
    //Select service to use
    var service = '';
    if (req.query.id && req.query.askFastAccountId) {
        logger.info('getting user -- > ' + req.query.id);
        user.getUser(req.query.id, req.query.askFastAccountId).then(function(result) {
            if(result==null) {
                logger.error('No audio fetched. Because no account found');
                return res.redirect('/audio/ttsFail.wav');
            } else {
                return Parser.parseRequest(req, res, next, result)
            }
        }, function(error) {
            logger.error('No audio fetched. Because no account found');
            return res.redirect('/audio/ttsFail.wav');
        });
    } else {
        return Parser.parseRequest(req, res, next, null);
    }
}
Parser.parseRequest = function(req, res, next, ttsUser) {

    var service = '';
    if(ttsUser) {
        service = ttsUser && ttsUser.service ? ttsUser.service.toLowerCase() : 'voicerss';
    } else {
        service = req.query.service ? req.query.service.toLowerCase() : "voicerss";
    }
    logger.info('service; ' + service);
    var text = req.query.text;
    var language = req.query.lang ? req.query.lang : "nl-nl";
    var codec = req.query.codec ? req.query.codec : "WAV";
    var format = req.query.format ? req.query.format : "8khz_8bit_mono";
    var voice = req.query.voice ? req.query.voice : 'sharon8k';
    var ttsAccountId = req.query.id ? req.query.id : null;

    if (text == null || text == "") {
        return res.status(500).send('No text was given!');
    }
    //if text starts with a url and ends with a .wav extension, create a proxy. fetch the audio and pipe it to the response
    else if (text.indexOf('http') == 0 && text.lastIndexOf('.wav') + 4 == text.length) {
        logger.info('url seen instead of text: ' + text);
        request.get({
            headers: {
                "User-Agent": "AskFastAudioGateway/1.0"
            },
            url: text
        }, function(err, response, body) {}).pipe(res);
        return res;
    }

    text = text.toLowerCase();
    var hash = Parser.createHash(text + service + voice + language + ttsAccountId);
    var filename = hash + '.wav';

    var textOptions = {
        language: language,
        codec: codec,
        format: format,
        text: text,
        voice: voice,
        id: ttsAccountId
    }

    var gfs = Grid(db, mongo);
    var options = {
        filename: filename
    };

    gfs.files.findOne(options, function(err, file) {

        if (err) return console.dir(err);

        if (file == null) {
            logger.info('Not found creating new file');

            var writestream = gfs.createWriteStream({
                filename: filename,
                mode: 'w',
                content_type: 'audio/wav'
            });
            //see if the request want premium stream.
            if (service == 'acapela') {
                logger.info('use acapela');
                acapela.fetchAudio(writestream, textOptions, res, ttsUser);
            } else {
                logger.info('use voicerss');
                var users = [];
                if (ttsUser) {
                    users.push(ttsUser);
                    voicerss.fetchAudio(writestream, textOptions, 0, res, users);
                } else {
                    voicerss.fetchAudio(writestream, textOptions, 0, res, null);
                }
            }

            writestream.on('close', function(file) {
                res.writeHead(200, {
                    'Content-Type': file.contentType
                });
                var readstream = gfs.createReadStream({
                    filename: filename
                });
                readstream.pipe(res);
            });
        } else {
            res.writeHead(200, {
                'Content-Type': file.contentType
            });

            logger.info('Found re-using old file!!!');
            var readstream = gfs.createReadStream({
                filename: filename
            });

            readstream.pipe(res);
        }
    });
}

Parser.createHash = function(text) {
    return crypto.createHash("md5")
        .update(text)
        .digest("hex");
}

Parser.delete = function(req, res, next) {
    var text = req.query.text.toLowerCase();
    var hash = Parser.createHash(text);
    var filename = hash + '.wav';

    var gfs = Grid(db, mongo);
    var options = {
        filename: filename
    };
    gfs.remove(options, function(err) {
        if (err) return console.log(err);
        res.send('Deleted: ' + filename);
    });
}

module.exports = Parser;