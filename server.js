/*
 * Websocket server. Routes any communication from the client side
 * through to the router which then routes it through the requestHandlers class.
 */

var io = require('socket.io').listen(8080, {'log level':0});
var genericEmitter = require('./ee').GenericEmitter;

function start(route, handler) {

	io.sockets.on('connection', function(socket) {
		//handle incoming notifications
		socket.on('notification', function(data) {
			route(handler, data);
		});
		
		socket.on('disconnect', function(){
			route(handler, {type:'disconnect'});
		});

		genericEmitter.on('toSocket', function(type, data) {
			socket.emit('clientNotification', {
				type : type,
				data : data
			});
		});
	});

}

exports.start = start;

