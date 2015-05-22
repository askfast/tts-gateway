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

ttsAgent.prototype.rpcFunctions.getUser = function(params) {
    return user.getUser(params.userId, params.accountId);
};

ttsAgent.prototype.rpcFunctions.getUsers = function(params) {
    return user.getUsers(params.accountId);
};

ttsAgent.prototype.rpcFunctions.createUser = function(params) {
    return user.createUser(params.user);
};

ttsAgent.prototype.rpcFunctions.updateUser = function(params) {
    return user.updateUser(params.user, params.userId, params.accountId);
};

ttsAgent.prototype.rpcFunctions.deleteUser = function(params) {
    return user.deleteUser(params.userId, params.accountId);
}
module.exports = ttsAgent;