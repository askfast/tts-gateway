var mongo = require('mongodb'),
    Db = mongo.Db;

var dbName = "tts-cache"
var db = null
Db.connect("mongodb://localhost:27017/" + dbName, function(err, database) {
    if (err) return console.dir(err);

    db = database;
    exports.db = db

});



