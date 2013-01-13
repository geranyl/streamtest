/*
 * Make sure only calls we are set up to handle are passed through to the requestHandler class.
 */

function route(handle, notification){
	if(typeof handle[notification.type]==='function'){
		handle[notification.type](notification.data);
	}else{
		console.log('No handler found for '+pathname);
	}
}

exports.route = route;