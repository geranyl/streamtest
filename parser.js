/*
 * Extends the streaming base class in node.js and handles parsing of the incoming twitter stream.
 */

var Parser = function() {
	this.readable = true;
	this.writable = true;
	this.buffer = new Buffer('');
	this.tracking = {};
	this.hashOn = false;
	this.timerDelay = 1000; //default of 1 second
	this.debug = false; //turn to true if you want to see the tweets scroll by in terminal	
}

require('util').inherits(Parser, require('stream'));

Parser.prototype.setTracking = function(trackParams, lookForHashtagsOnly) {
	var arr = trackParams.split(',');
	if(lookForHashtagsOnly){
		this.hashOn = true;
	}
	for (var i = 0; i < arr.length; i += 1) {
		this.tracking[arr[i]] = 0;
	}
}

//change timer interval here
Parser.prototype.setTimer = function(delay) {
	this.timerDelay = delay;
}

//report the number of counts for each tracked phrase since the last interval; reset all to zero post report
Parser.prototype.count = function(parser) {
	var tally = 0;
	for (var key in parser.tracking) {
		tally += parser.tracking[key];
	}
	var data = parser.tracking;
	data.tally = tally;
	parser.emit('tracking', data);
	for (var key in parser.tracking) {
		parser.tracking[key] = 0;
	}	
}

//parses the actual tweet, delimiter already removed when the buffer was converted to a string
Parser.prototype.parse = function(tweet) {
	if (this.debug) {
		process.stdout.write('\n' + tweet + '\n');
	}
	var json = JSON.parse(tweet);
	//only looking at english language users
	if (json && json.user && json.user.lang === 'en') {
		
		//hash tags - looking at hashtags listed in tweet
		//"entities":{"hashtags":[{"text":"Love","indices":[45,50]}], ... <--format in tweets
		if (this.hashOn) {
			if (json.entities && json.entities.hashtags.length > 0 && json.entities.hashtags[0].text) {
				var tags = json.entities.hashtags[0].text.split(',');
				var i, length = tags.length;
				for ( i = 0; i < length; i += 1) {
					var prop = tags[i].toLowerCase();
					if (this.tracking.hasOwnProperty(prop)) {
						this.tracking[prop] += 1;
					}
				}
			}
		} else {
			//no hash tags, looking at text only
			for (var key in this.tracking) {
				if (json.text.toLowerCase().indexOf(key.toLowerCase()) > -1) {
					this.tracking[key] += 1;
				}
			}
		}
	}

}

//Write incoming data to a buffer until a full tweet has been received. Then send it to the parse function for processing.
Parser.prototype.write = function(data) {
	var length = parseInt(data);
	if (length > 0) {
		var offset = length.toString().length;
		var buf = new Buffer(length + offset);
		var len = buf.write(data);
		this.buffer = Buffer.concat([buf, this.buffer]);
		var str = this.buffer.toString('utf8', offset, len);
		if (Buffer.byteLength(str) === length) {
			//you have a full message
			if (!this.timer) {
				this.timer = setInterval(this.count, this.timerDelay, this);
			}
			this.parse(str);
			this.buffer = new Buffer('');
		}
	} else if (data && this.buffer.length > 0) {
		//long tweet - more data coming in to meet the initial predicted length
		this.buffer.write(data, this.buffer.length);
	}
	
	this.emit('data', data);
};

Parser.prototype.end = function(data) {
	this.write(data);
	this.emit('end');
};


Parser.prototype.destroy = function() {
	clearInterval(this.timer);
}

exports.Parser = Parser;
