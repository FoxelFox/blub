var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var path = require('path');
var router = express.Router();
var controller = require('./server/ControllerNew.js');
var ctrl = new controller(socket);
router.use(express.static('client'));
router.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/html/index.html');
});
app.use('/', router);
http.listen(1337);
//# sourceMappingURL=main.js.map