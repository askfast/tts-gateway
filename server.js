/**
 * Created by Sven Stam on 30-05-14.
 */
var express = require('express'),
    path = require('path'),
    eve = require('evejs'),
    router = require('./lib/router')
    bodyParser = require('body-parser'),
    TtsAgent = require('./lib/ttsAgent');

//setup eve
eve.system.init({
    transports: [{
        type: 'http',
        port: 3000,
        url: 'http://127.0.0.1:3000/agents/:id',
        remoteUrl: 'http://127.0.0.1:3000/agents/:id',
        localShortcut: true,
        default: true
    }]
});

var ttsAgent = new TtsAgent('ttsAgent')

//setup api server
var PORT = 3001;

var app = express();

app.use(bodyParser.json())

app.use('/api', router);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT);
console.log("TTS-Parser running on port: " + PORT);