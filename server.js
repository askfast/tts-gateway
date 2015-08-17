/**
 * Created by Sven Stam on 30-05-14.
 */
var express = require('express'),
    path = require('path'),
    eve = require('evejs'),
    router = require('./lib/router')
    bodyParser = require('body-parser'),
    TtsAgent = require('./lib/ttsAgent'),
    logger = require('./lib/utils/logger'),
    config = require('./config.json')[ process.env.NODE_ENV || 'dev' ];

//setup eve
eve.system.init({
    transports: [{
        type: 'http',
        port: config.agentPort,
        url: 'http://127.0.0.1:' + config.agentPort + '/agents/:id',
        remoteUrl: 'http://127.0.0.1:' + config.agentPort + '/agents/:id',
        localShortcut: true,
        default: true
    }]
});

var ttsAgent = new TtsAgent('ttsAgent')

//setup api server
var PORT = config.port;

var app = express();

app.use(bodyParser.json())

app.use('/api', router);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT);
logger.info("TTS-Parser running on port: " + PORT);