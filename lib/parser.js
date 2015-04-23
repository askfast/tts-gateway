/**
 * Created by Sven Stam on 30-05-14.
 */
var mongo = require('mongodb'),
    Db = mongo.Db, 
    request = require('request'),
    Grid = require('gridfs-stream'),
    crypto = require('crypto'),
    voicerss = require('./voicerss'),
    acapela = require('./acapela');

 var Parser = {};

var dbName = "tts-cache"
var db;
Db.connect("mongodb://localhost:27017/"+dbName, function(err, database) {
    if(err) return console.dir(err);

    db = database;
});

Parser.parse = function (req, res, next) {
    //Select service to use
    var service = req.query.service ? req.query.service.toLowerCase() : 'voicerss';

    var text = req.query.text;
    var language = req.query.lang ? req.query.lang : "nl-nl";
    var codec = req.query.codec ? req.query.codec : "WAV";
    var format = req.query.format ? req.query.format : "8khz_8bit_mono";
    var voice = req.query.voice ? req.query.voice : 'sharon8k';
    var askId = req.query.askId ? req.query.askId : null; 

    if(text==null || text=="") {
        return res.status(500).send('No text was given!');
    }
    //if text starts with a url and ends with a .wav extension, create a proxy. fetch the audio and pipe it to the response
    else if(text.indexOf('http') == 0 && text.lastIndexOf('.wav') + 4 == text.length) {
            console.log('url seen instead of text: '+ text);
            request.get({headers: { "User-Agent": "AskFastAudioGateway/1.0"}, url: text},function(err, response, body) {
        }).pipe(res);
        return res;
    }

    text = text.toLowerCase()
    var hash = Parser.createHash(text + service + voice + language);
    var filename = hash + '.wav';

    var textOptions ={
        language:language,
        codec:codec,
        format:format,
        text:text,
        voice:voice,
        askId:askId
    }

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
            //see if the request want premium stream.
            if(service == 'acapela'){
                console.log('use acapela');
                acapela.fetchAudio(writestream, textOptions, res);
            }else{ 
                console.log('use voicerss');
                voicerss.fetchAudio(writestream, textOptions, 0, res);

            }
            
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