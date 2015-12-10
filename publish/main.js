var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var router = express.Router();
var controller = require('./private/ControllerNew.js');
var ctrl = new controller(io);
router.use(express.static('public'));
router.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
});
app.use('/', router);
http.listen(1337);
//# sourceMappingURL=main.js.map