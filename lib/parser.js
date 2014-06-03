/**
 * Created by Sven Stam on 30-05-14.
 */
var mongo = require('mongodb'),
    request = require('request');
    Grid = require('gridfs-stream'),
    Db = mongo.Db,
    crypto = require('crypto');

var Parser = {};
var KEY = ''; // ADD YOUR VOICE RSS API KEY HERE!!
var baseUrl = 'http://api.voicerss.org/?';
var codec = 'WAV';
var language = 'nl-nl';
var format = '8khz_8bit_mono';

var dbName = "tts-cache"
var db;
Db.connect("mongodb://localhost:27017/"+dbName, function(err, database) {
    if(err) return console.dir(err);

    db = database;
});

Parser.parse = function (req, res, next) {

    var text = req.query.text;

    if(text==null || text=="") {
        return res.status(500).send('No text was given!');
    }

    text = text.toLowerCase()
    var hash = Parser.createHash(text);
    var filename = hash + '.wav';

    var url = baseUrl;
    url += 'key=' + KEY;
    url += '&hl='+language;
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

            // Make sure only audio files get stored
            var x = request.get(url).on('response', function(resp) {
                if(resp.headers['content-type'].indexOf('audio/wav')==-1) {
                    x.pipe(res);
                } else {
                    x.pipe(writestream);
                }
            });

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