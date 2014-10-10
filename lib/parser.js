/**
 * Created by Sven Stam on 30-05-14.
 */
 var mongo = require('mongodb'),
 request = require('request');
 Grid = require('gridfs-stream'),
 Db = mongo.Db,
 crypto = require('crypto');

 var Parser = {};
var KEYS = ['asdfsdf', '']; // ADD YOUR VOICE RSS API KEYS HERE!!
var baseUrl = 'http://api.voicerss.org/?';

var dbName = "tts-cache"
var db;
Db.connect("mongodb://localhost:27017/"+dbName, function(err, database) {
    if(err) return console.dir(err);

    db = database;
});

Parser.parse = function (req, res, next) {

    var text = req.query.text;
    var language = req.query.lang ? req.query.lang : "nl-nl";
    var codec = req.query.codec ? req.query.codec : "WAV";
    var format = req.query.format ? req.query.format : "8khz_8bit_mono";

    if(text==null || text=="") {
        return res.status(500).send('No text was given!');
    }
    //if text starts with a url and ends with a .wav extension, create a proxy. fetch the audio and pipe it to the response
    else if(text.indexOf('http') == 0 && text.lastIndexOf('.wav') + 4 == text.length) {
            console.log('url seen instead of text: '+ text);
            request.get(text,function(err, response, body) {
        }).pipe(res);
        return res;
    }

    text = text.toLowerCase()
    var hash = Parser.createHash(text + language);
    var filename = hash + '.wav';

    var url = baseUrl;
    url += 'hl='+language;
    url += '&c='+codec;
    url += '&f='+format;
    url += '&src='+text;

    var gfs = Grid(db, mongo);
    var options = {filename: filename};

    gfs.files.findOne(options, function (err, file) {

        if (err) return console.dir(err);

        if(file==null) {
            console.log('Not found creating new file');

            var writestream = gfs.createWriteStream({
                filename: filename,
                mode: 'w',
                content_type: 'audio/wav'
            });

            fetchAudio(writestream, url, 0, res);

            writestream.on('close', function (file) {
                res.writeHead(200, {'Content-Type': file.contentType});
                var readstream = gfs.createReadStream({
                    filename: filename
                });
                readstream.pipe(res);
            });
        } else {
            res.writeHead(200, {'Content-Type': file.contentType});

            console.log('Found re-using old file!!!');
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

function fetchAudio(writestream, urlWithoutKey, keyIndex, response) {
    console.log('urlWithoutKey: ' + urlWithoutKey + ' keyIndex: '+ keyIndex);
    var urlWithKey = urlWithoutKey + '&key='+ KEYS[keyIndex];
    var x = request.get(urlWithKey).on('response', function parseFetchAudioResponse(res) {
                // Make sure only audio files get stored
                if(res.headers['content-type'].indexOf('audio/wav')==-1) {
                    res.on('data', function(chunk) {
                     console.log('Audio not fetched with Key: ' + KEYS[keyIndex] + ' and Index: '+ keyIndex + '. Response is: ' + chunk );
                    });
                    if(keyIndex < KEYS.length - 1) {
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

Parser.delete = function (req, res, next) {
    var text = req.query.text.toLowerCase();
    var hash = Parser.createHash(text);
    var filename = hash + '.wav';

    var gfs = Grid(db, mongo);
    var options = {filename: filename};
    gfs.remove(options, function (err) {
        if (err) return console.log(err);
        res.send('Deleted: '+filename);
    });
}

module.exports = Parser;