//Rest interface for 

var express = require('express'),
    router = express.Router(),
    User = require('./user.js'),
    Parser = require('./parser.js');

router.get('/parse', Parser.parse);
router.get('/delete', Parser.delete);
router.post('/user', function(req, res) {
    User.createUser(req.body, function(err, result) {
        if (err) throw err
        res.json(result);
    });
});
router.get('/user', function(req, res) {
    User.getUsers(function(err, result) {
        res.json(result);
    });
});
router.put('/user/:userId', function(req, res) {
    User.changeUser(req.body, req.params.userId, function(err, result) {
        if (err) throw err
        res.json(result);
    })
});
router.delete('/user/:userId', function(req, res) {
    User.deleteUser(req.params.id, function(err, result) {
        res.json(result);
    })
});

module.exports = router;