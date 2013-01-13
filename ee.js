/*
 * Generic event emitter to be used in the node app.
 */

var GenericEventEmitter = function(){
	
}

require('util').inherits(GenericEventEmitter, require('events').EventEmitter);

var ee = new GenericEventEmitter();

exports.GenericEmitter = ee;
