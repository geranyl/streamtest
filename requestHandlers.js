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
var request;

function twit(data) {
    //disconnect before attempting to reconnect to the streaming api
    if (request) {
        try{
            request.removeAllEventListeners();
        }catch(e){
            console.log(e);
        }
        try {
            request.abort();
        } catch (e) {
            console.log(e);
        }
        request = null;
    }

    //clear out the parser - TODO: don't recreate on reconnection attempts
    if (parser) {
        disconnect();
    }

	/**Asking for delimited data by attaching delimited = length to the post body. 
	 * https://dev.twitter.com/docs/streaming-apis/parameters#delimited
	 * 'The 1953 indicates how many bytes to read off of the stream to get the 
	 * rest of the Tweet (including \r\n). The next length delimiter will occur exactly after 1953 bytes.'
	 **/
	
	data.params.delimited = 'length'; 
		
	parser = new Parser();
	parser.setTracking(data.params.track, data.params.hashOn);
	
	delete data.params.hashOn;
	request = oa.post(twitterURL, config.ACCESS_TOKEN, config.ACCESS_TOKEN_SECRET, data.params, null);

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

        response.on('end', function () {
            process.stdout.write('stream ended - goodbye' + response.statusCode + '\n');


            var delay;
            //status ok - likely due to logging back in with the same credentials - wait 30 seconds and try connecting again
            if (response.statusCode == 200) {
                delay = 1000 * 30;

            } else if (response.statusCode == 420) {
                //too many attempts to connect in a short period of time - need to wait at least 5 minutes before trying - rate limited
                delay = 1000 * 60 * 5;

            }

            if (delay) setTimeout(function () {
                twit(data);
            }, delay);
        });
	});
	request.end();
}

function disconnect() {
    if(parser){
	    parser.end();
	    parser.destroy();
    }
}

exports.twit = twit;
exports.disconnect = disconnect; 