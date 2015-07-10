var winston = require('winston'),
  winstonSlack = require('winston-slack').Slack;

var token = "";

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp':true}),
    new (winstonSlack)({
      domain: "ask-fast",
      apiToken: token,
      channel: "#askfast-tts",
      username: "ErrorBot",
      level: 'error',
      handleExceptions : true
    })
  ]
});

module.exports = logger;