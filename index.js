/*
 * The main class for the node application. 
 * You may see this called app.js at times.
 */
var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {};
handle['twit'] = requestHandlers.twit;
handle['disconnect'] = requestHandlers.disconnect;


//catch unhandled errors in node
process.on('uncaughtException', function(err){
	console.log(err);
});


//start the server
server.start(router.route, handle);


