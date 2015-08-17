var mongo = require('mongodb'),
    Db = mongo.Db
    config = require('../../config.json')[ process.env.NODE_ENV || 'dev' ];

var db = null
Db.connect(config.db.url, function(err, database) {
    if (err) return console.dir(err);

    db = database;
    exports.db = db

});



