var eve = require('evejs'),
    acapela = require('./acapela'),
    user = require('./user'),
    Promise = require('bluebird');

function ttsAgent(id) {
    // execute super constructor
    eve.Agent.call(this, id);

    this.rpc = this.loadModule('rpc', this.rpcFunctions);

    // connect to all transports configured by the system
    this.connect(eve.system.transports.getAll());

}

// extend the eve.Agent prototype
ttsAgent.prototype = Object.create(eve.Agent.prototype);
ttsAgent.prototype.constructor = ttsAgent;

// define RPC functions, preferably in a separated object to clearly distinct
// exposed functions from local functions.
ttsAgent.prototype.rpcFunctions = {};

ttsAgent.prototype.rpcFunctions.getCredentials = function(params) {
    return new Promise(function(resolve, reject) {
        user.getCredentialsById(params.userId, function(err, obj) {
            if (err) {
                reject(err)
            } else(
                resolve({
                    result: obj
                }))
        })
    })
};

ttsAgent.prototype.rpcFunctions.newUser = function(params) {
    return new Promise(function(resolve, reject) {
        user.createUser(params, function(err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
};

ttsAgent.prototype.rpcFunctions.deleteUser = function(params) {
    return new Promise(function(resolve, reject) {
        if (!params.userId) {
            reject({
                message: 'No userId'
            })
        } else {
            user.deleteUser(params.userId, function(err, result) {
                if (err) {
                    console.log('oops')
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        }

    })
}

module.exports = ttsAgent;