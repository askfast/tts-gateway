var winston = require('winston'),
  winstonSlack = require('winston-slack').Slack
  config = require('../../config.json')[ process.env.NODE_ENV || 'dev' ];

var token = config.log.slack.token;

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp:true,
      level: config.log.console.level
    }),
    new (winstonSlack)({
      domain: "ask-fast",
      apiToken: token,
      channel: "#askfast-tts",
      username: "ErrorBot",
      level: config.log.slack.level,
      handleExceptions : true
    })
  ]
});

module.exports = logger;