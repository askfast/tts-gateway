var winston = require('winston'),
  winstonHipchat = require('winston-hipchat').Hipchat;

var token = "2831704d35db87dd8f6434dda6260c";
var room = "askfast-issues";

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp':true}),
    new (winstonHipchat)({
      level: "error",
      token: token,
      notify: true,
      room: room,
      from: "tts-gateway"
    })
  ]
});

module.exports = logger;