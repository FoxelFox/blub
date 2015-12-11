import io = require('socket.io-client');
import angular = require('angular');
import Game = require('./game');

var app = angular.module('App', []);
var game = new Game();

window.onload = game.init;

app.controller('indexController', function (socket: SocketIO.Socket) {

    socket.on('player:load', function (res) {
        var data = JSON.parse(res).data;

        game.onPlayerLoad(data, function () {
            socket.emit('player:join', {}, function (res) {
                game.onJoin(JSON.parse(res).data);
            });
        });
    });

    socket.on('game:join', function (res) {
        game.onGameJoin(JSON.parse(res).data);
    });

    socket.on('game:spawn', function (res) {
        game.onSpawn(res);
    });

    socket.on('server:update', function (res) {
        game.addServerUpdate(JSON.parse(res).data);
        socket.emit('player:update', JSON.stringify(game.getLocalPlayerUpdate()));
    });
});

app.factory('socket', function ($rootScope) {
    var socket = io();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

app.controller('chatController', function (socket) {
    var chat = this;
    chat.log = [];
    chat.message = '';

    this.onPost = function () {
        if (chat.message !== '') {
            socket.emit('chat message', chat.message);
            chat.message = '';
        }
    };

    socket.on('chat log', function (res) {
        var div = document.getElementById("chat-log-div");
        div.scrollTop = div.scrollHeight;
        chat.log.push(res);
    });
});
