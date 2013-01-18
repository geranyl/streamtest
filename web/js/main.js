/*Nothing here has been namespaced as it is just a local test. 
 * If you're using elements of this for your own project, please namespace your javascript.
 * Let's keep global nice and clean.
 */

$(document).ready(function() {

	$('#go').click(function(e) {
		e.preventDefault();
		getTrackTerms();
	});
});

var socket;
var stripper = /#/gi;

/* Emits a notification to the websocket. By giving it a type - in this case 'twit'
 * the server side (node.js) will know how to handle the call. I like to keep things 
 * generic, so I have a data object I stuff properties into as part of the object 
 * I'm sending to the websocket.
 * 
 * @param {Object} track - the string twitter uses for tracking https://dev.twitter.com/docs/streaming-apis/parameters#track
 * 
 */
function twit(track, hashOn) {
	socket.emit('notification', {
		type : 'twit',
		data : {
			'params' : {
				'track' : track,
				'hashOn' : hashOn
			}
		}
	});
}

function startSocket(track, hashOn) {
	
	if (socket) {
		socket.emit('notification', {
			type : 'disconnect'
		});
		twit(track, hashOn);
	} else {
		socket = io.connect('http://localhost:8080');
	}
	socket.on('connect', function(data) {
		twit(track, hashOn);
		//when the websocket gets a call from the server of type 'clientNotification' it will process it here
		socket.on('clientNotification', function(data) {
			//show the visual data as a console trace
			console.log(data.type, data.data);
			var sum = 1;
			if (data.data.tally) {
				sum = data.data.tally;
			}
			
			//show the relative amount of each tracking term as a % of the progress bar width 
			for (var key in data.data) {
				var val = data.data[key];
				var perc = Math.round(val / sum * 100);
				var keyId = key.replace(/\s/gi, '');
				$('#' + keyId).find('div.bar').css('width', perc + '%');
				$('#' + keyId + 'Label').html(key);
				$('#' + keyId + 'Count').html(val); //show the actual number of times the term being tracked showed up
			}
		});
	});
}

//show results using progress bars
function getTrackTerms() {
	var t1 = $('#inputTermOne').val();
	var t2 = $('#inputTermTwo').val();
	var hashOn = $('#hashtag:checked').val()?true:false;	
	
	if(stripper.test(t1) || stripper.test(t2)){
		hashOn = true;
		$('#hashtag').attr('checked', true);
	}
	
	var terms = [t1.replace(stripper,''), t2.replace(stripper,'')];
	
	//set up html for visual representation of twitter results
	var str = '<div class="span5">';
	for (var i = 0; i < terms.length; i += 1) {
		var key = terms[i].replace(/\s/gi, '');
		str += '<span id="' + key + 'Label">'+terms[i]+'</span>' + '<span class="badge" id="' + key + 'Count">0</span>'+'<div class="progress progress-info" id="' + key + '">' + '<div class="bar" style="width: 0%"></div>' + '</div>';
	}
	str += '</div>';
	
	$('#results').html(str);
	
	//concatenate values of input term 1 and input term 2 using a comma. 
	//The track parameter of the Twitter streaming API treats the commas as an 'OR'.
	
	startSocket(terms.join(), hashOn);
}

