var mongo = require('mongodb'),
    Db = mongo.Db,
    ObjectID = require('mongodb').ObjectID,
    Promise = require('bluebird')

var dbName = "tts-cedentials"
var collection = 'credentials'
var db;
Db.connect("mongodb://localhost:27017/" + dbName, function(err, database) {
    if (err) return console.dir(err);

    db = database.collection(collection);
});

var User = {}

User.createUser = function(user, callback) {
    db.insert(user, function(err, result) {
        if (err) {
            callbakc(err, null)
        } else {
            callback(null, result[0]._id)
        }
    })
};

User.getUsers = function(callback) {
    db.find().toArray(function(err, items) {
        if(err){
        	callback(err,items)
        }
        else{
        	callback(null,items)
        }
    })
}

User.getCredentialsById = function(id, callback) {
    db.findOne({
        _id: ObjectID(id)
    }, function(err, item) {
        callback(null, item)
    })
};
/**
 * changeUser 
 * @param  {JSON}   user    a JSON object containing a user
 * @param  {STRING}   userId   a userId string
 * @param  {Function} callback [description]
 * 
 */
User.changeUser = function(user, userId, callback) {
    db.update({
        _id: ObjectID(userId)
    }, {
        $set: user
    }, function(err, result) {
        if (err) {
            callback(err, result)
        } else(
            callback(null, result)
        )
    })
};

User.deleteUser = function(userId, callback) {
	console.log(userId)
    if (!userId) {
        callback(Error('No user id'))
    } else {
        db.remove({
            _id: ObjectID(user.userId)
        }, function(err, result) {
            console.log(result)
            if (err) {
                console.log('err!')
                callback(err, null)
            } else {
                console.log('removed')
                callback(null, result)
            }
        })
    }

}



module.exports = User
