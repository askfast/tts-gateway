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

var User = {};

User.createUser = function(user) {
    return new Promise( function(resolve,reject) {
        db.insert(user, function(err, result) {
        if (err) {
            reject(err)
        } else {
            resolve( result[0]._id)
        }
    })
    });
};

User.getUsers = function(askFastAccountId) {
    return new Promise(function(resolve, reject) {
            db.find({accountId: askFastAccountId}).toArray(function(err, result) {
        if(err){
        	reject(err)
        }
        else{
        	reject(result)
        }
    })  
    })
}

User.getCredentialsById = function(id) {
    return new Promise(function(resolve, reject) {
        db.findOne({
        _id: ObjectID(id)
    }, function(err, item) {
        if(err) {
            reject(err);
        }
        else {
            resolve(item)
        }
    })  
    })
};

/**
 * changeUser 
 * @param  {JSON}   user    a JSON object containing a user
 * @param  {STRING}   userId   a userId string
 * @param  {Function} callback [description]
 * 
 */
User.changeUser = function(user, userId) {
    return new Promise(function(resolve, reject) {
        db.update({
        _id: ObjectID(userId)
    }, {
        $set: user
    }, function(err, result) {
        if (err) {
            reject(err)
        } else(
            resolve(result)
        )
    })  
    })
};

User.deleteUser = function(userId) {
    return new Promise(function(resolve, reject) {
            if (!userId) {
        reject('No user id')
    } else {
        db.remove({
            _id: ObjectID(userId)
        }, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        });
    }  
    })
}



module.exports = User
