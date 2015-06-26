var winston = require('winston'),
  winstonHipchat = require('winston-hipchat').Hipchat;

var token = "";
var room = "askfast issues";

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp':true}),
    new (winstonHipchat)({
      level: "severe",
      token: token,
      notify: true,
      room: room,
      from: "tts-gateway"
    })
  ]
});

module.exports = logger;