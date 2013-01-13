streamtest
==========

twitter streaming API test

<p>A small test to try out twitter's realtime streaming API - specifically the POST statuses/filter endpoint - using node.js for the backend.<br/>
The idea is to compare how many times each of two terms comes through the streaming API per second (this interval is adjustable). For example - comparing the number of times the word 'love' shows up vs 'hate' per second. </p>
<p>
I chose node.js as it's very well suited to handling streaming data - http://nodejs.org/api/stream.html.
</p>


<h2>Overview:</h2>
<p>Using a websocket connection, two words or phrases are sent through to the backend in order to search through twitter. Only tweets containing the terms being searched for are streamed by using the 'track' parameter in twitter's streaming API.</p>
<p>The backend uses parser.js to handle streaming data. Since twitter sends through the number of bytes each tweet is (see https://dev.twitter.com/docs/streaming-apis/parameters#delimited), the parser writes incoming data to a buffer until all bytes have been received at which point it examines the full tweet. Most tweets seem to come through as one chunk of data, but some are broken up over a couple - hence the need to wait until the buffer length matches the number of bytes the tweet is supposed to be.</p>
<p>When examining the tweet, the parser counts the number of times each tracked term shows up and once a second (or whatever delay the timer is set to) has passed, it dispatches the totals to the front end. The front end then displays the data for easy reading.</p>


<p>
<h2>Recipe:</h2>
<ul>
<li>Twitter Bootstrap http://twitter.github.com/bootstrap/ - for easy front end prototyping

<li>Initializr  http://www.initializr.com/ - with the Twitter Bootstrap option chosen for a quick starting point for front end development

<li>Node JS for Beginners http://www.nodebeginner.org/ - for guidance on making modular node.js apps

<li>Node JS http://nodejs.org/ - the backend that makes it easy to work with streaming data

<li>Node OAuth https://github.com/ciaranj/node-oauth - a great node.js library that makes OAuth simple. Install with the node package manager:  npm install oauth

<li>Socket.io http://socket.io/ - a really easy to use websocket library (server and client) that makes programming real time communication simple. Install with the node package manager: npm install socket.io
</ul>
</p>


<p><h2>Getting Started:</h2>
<ul>
<li><b>Step 1:</b> Install node.js. Laugh manically that you don't have to deal with LAMP.

<li><b>Step 2:</b> Realize you still need to run a local server. Hang your head while installing and or running MAMP (or WAMP for you non-mac folk).

<li><b>Step 3:</b> In a command line environment (e.g. Terminal), navigate to the directory the project is in. Type in npm install [package here] and delight in the magic that is the node package manager.

<li><b>Step 4:</b> Create a test application through http://dev.twitter.com You'll need your application's OAuth settings as well as your access token. This test application doesn't go through the process of creating an access token for users from the front end. 

<li><b>Step 5:</b> Make sure config.js contains your twitter information from step 4. 

<li><b>Step 6:</b> Navigate to the location of index.js using Terminal. Start the app by entering the following:<br/>
node index.js
</ul>


<b>Installing node packages with the node package manager</b><br/>

I'm an OSX user, so forgive the lack of windows terminology.<br/>
Using the command line (Terminal) navigate to where you've set up your project. Then, run the node package manager command there:<br/>

e.g. npm install oauth<br/>

Yes, it's that simple.
</p>
