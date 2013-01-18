/* 
 * Handle websocket requests that come in through this class.
 * Request of type twit or disconnect will be handled.
 */

var sys = require('sys');
var util = require('util');
var config = require('./config').config;
var OAuth = require('oauth').OAuth;
var Parser = require('./parser').Parser;
var genericEmitter = require('./ee').GenericEmitter;
var twitterURL = 'https://stream.twitter.com/1.1/statuses/filter.json';
var oa = new OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', config.CONSUMER_KEY, config.CONSUMER_SECRET, '1.0', null, 'HMAC-SHA1');
var parser;


function twit(data) {
	
	/**Asking for delimited data by attaching delimited = length to the post body. 
	 * https://dev.twitter.com/docs/streaming-apis/parameters#delimited
	 * 'The 1953 indicates how many bytes to read off of the stream to get the 
	 * rest of the Tweet (including \r\n). The next length delimiter will occur exactly after 1953 bytes.'
	 **/
	
	data.params.delimited = 'length'; 
		
	parser = new Parser();
	parser.setTracking(data.params.track, data.params.hashOn);
	
	delete data.params.hashOn;
	var request = oa.post(twitterURL, config.ACCESS_TOKEN, config.ACCESS_TOKEN_SECRET, data.params, null);

	parser.setTimer(1000);//defaults to 1000 anyhow
	parser.on('tracking', function(data) {
		genericEmitter.emit('toSocket', 'tracking', data);
	});

	request.on('response', function(response) {
		response.setEncoding('utf8');
		response.pipe(parser, {
			end : false
		});
		
		response.on('error', function(){
			process.stdout.write('streaming error\n');
		});
		
		response.on('end', function() {
			process.stdout.write('stream ended - goodbye\n');
		});
	});
	request.end();
}

function disconnect() {
	parser.end();
	parser.destroy();
}

exports.twit = twit;
exports.disconnect = disconnect; 